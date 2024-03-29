use crate::data_structures::{LinkId, OrderId, StreamId, TrackId};
use crate::mysql_client::MySqlConnection;
use crate::storage::db::repositories::errors::RepositoryResult;
use crate::storage::db::repositories::{FileRow, LinkRow, TrackRow};
use chrono::Duration;
use sqlx::{query, Execute, MySql, QueryBuilder, Row};
use std::ops::{Deref, DerefMut};
use tracing::trace;

#[derive(sqlx::FromRow, Clone, Debug)]
pub(crate) struct TrackFileLinkMergedRow {
    #[sqlx(flatten)]
    pub(crate) track: TrackRow,
    #[sqlx(flatten)]
    pub(crate) file: FileRow,
    #[sqlx(flatten)]
    pub(crate) link: LinkRow,
}

fn create_select_query_builder<'a>() -> QueryBuilder<'a, MySql> {
    QueryBuilder::new(
        r#"
SELECT `r_tracks`.`tid`,
       `r_tracks`.`file_id`,
       `r_tracks`.`uid`,
       `r_tracks`.`filename`,
       `r_tracks`.`hash`,
       `r_tracks`.`ext`,
       `r_tracks`.`artist`,
       `r_tracks`.`title`,
       `r_tracks`.`album`,
       `r_tracks`.`track_number`,
       `r_tracks`.`genre`,
       `r_tracks`.`date`,
       `r_tracks`.`cue`,
       `r_tracks`.`buy`,
       `r_tracks`.`duration`,
       `r_tracks`.`filesize`,
       `r_tracks`.`color`,
       `r_tracks`.`uploaded`,
       `r_tracks`.`copy_of`,
       `r_tracks`.`used_count`,
       `r_tracks`.`is_new`,
       `r_tracks`.`can_be_shared`,
       `r_tracks`.`is_deleted`,
       `r_tracks`.`deleted`,
       `fs_file`.`file_hash`,
       `fs_file`.`file_size`,
       `fs_file`.`file_extension`,
       `fs_file`.`server_id`,
       `fs_file`.`use_count`,
       `r_link`.`id`,
       `r_link`.`stream_id`,
       `r_link`.`track_id`,
       `r_link`.`t_order`,
       `r_link`.`unique_id`,
       `r_link`.`time_offset`
FROM `r_tracks` 
JOIN `fs_file` ON `fs_file`.`file_id` = `r_tracks`.`file_id`
JOIN `r_link` ON `r_tracks`.`tid` = `r_link`.`track_id`
"#,
    )
}

#[derive(Default, Debug)]
pub(crate) struct GetUserStreamTracksParams {
    pub(crate) color: Option<u32>,
    pub(crate) filter: Option<String>,
}

#[tracing::instrument(err, skip(connection))]
pub(crate) async fn get_stream_tracks_count(
    connection: &mut MySqlConnection,
    stream_id: &StreamId,
    params: &GetUserStreamTracksParams,
) -> RepositoryResult<i64> {
    let mut builder = QueryBuilder::new("SELECT COUNT(*) as `count` FROM `r_tracks`");

    builder.push("JOIN `r_link` ON `r_tracks`.`tid` = `r_link`.`track_id`");

    builder.push(" WHERE `r_link`.`stream_id` = ");
    builder.push_bind(stream_id.deref());

    if let Some(filter) = &params.filter {
        if !filter.is_empty() {
            builder.push(" AND MATCH(artist, title, genre) AGAINST (");
            builder.push_bind(filter);
            builder.push(" IN BOOLEAN MODE)");
        }
    };

    if let Some(color) = params.color {
        builder.push(" AND color = ");
        builder.push_bind(color);
    };

    let query = builder.build();

    trace!("Running SQL query: {}", query.sql());

    let count_row = query.fetch_one(connection.deref_mut()).await?;

    Ok(count_row.get("count"))
}

#[tracing::instrument(err, skip(connection))]
pub(crate) async fn get_stream_tracks(
    connection: &mut MySqlConnection,
    stream_id: &StreamId,
    params: &GetUserStreamTracksParams,
    offset: &Option<i64>,
    limit: &Option<i64>,
) -> RepositoryResult<Vec<TrackFileLinkMergedRow>> {
    let mut builder = create_select_query_builder();

    builder.push(" WHERE `r_link`.`stream_id` = ");
    builder.push_bind(stream_id.deref());

    if let Some(filter) = &params.filter {
        if !filter.is_empty() {
            builder.push(" AND MATCH(artist, title, genre) AGAINST (");
            builder.push_bind(filter);
            builder.push(" IN BOOLEAN MODE)");
        }
    };

    if let Some(color) = params.color {
        builder.push(" AND color = ");
        builder.push_bind(color);
    };

    builder.push(" ORDER BY `r_link`.`t_order`");

    match (limit, offset) {
        (Some(limit), Some(offset)) => {
            builder.push(" LIMIT ");
            builder.push_bind(offset);
            builder.push(", ");
            builder.push_bind(limit);
        }
        (Some(limit), _) => {
            builder.push(" LIMIT ");
            builder.push_bind(limit);
        }
        _ => (),
    }

    let query = builder.build_query_as::<TrackFileLinkMergedRow>();

    trace!("Running SQL query: {}", query.sql());

    let stream_audio_tracks = query.fetch_all(connection.deref_mut()).await?;

    Ok(stream_audio_tracks)
}

#[tracing::instrument(err, skip(connection))]
pub(crate) async fn get_single_stream_track_at_time_offset(
    connection: &mut MySqlConnection,
    stream_id: &StreamId,
    time_offset: &Duration,
) -> RepositoryResult<Option<(TrackFileLinkMergedRow, Duration)>> {
    let mut builder = create_select_query_builder();

    builder.push(" WHERE `r_link`.`stream_id` = ");
    builder.push_bind(stream_id.deref());

    builder.push(" AND `r_link`.`time_offset` <= ");
    builder.push_bind(time_offset.num_milliseconds());

    builder.push(" ORDER BY `r_link`.`t_order` DESC LIMIT 1");

    let query = builder.build_query_as::<TrackFileLinkMergedRow>();

    let optional_track = query.fetch_optional(connection.deref_mut()).await?;

    Ok(optional_track.map(|track| {
        let track_time_offset = Duration::milliseconds(track.link.time_offset);
        let track_position = *time_offset - track_time_offset;

        (track, track_position)
    }))
}

#[tracing::instrument(err, skip(connection))]
pub(crate) async fn get_current_and_next_stream_track_at_time_offset(
    connection: &mut MySqlConnection,
    stream_id: &StreamId,
    time_offset: &Duration,
) -> RepositoryResult<Option<(TrackFileLinkMergedRow, TrackFileLinkMergedRow, Duration)>> {
    let mut builder = create_select_query_builder();

    builder.push(" WHERE `r_link`.`stream_id` = ");
    builder.push_bind(stream_id.deref());

    builder.push(" AND `r_link`.`time_offset` + `r_tracks`.`duration` > ");
    builder.push_bind(time_offset.num_milliseconds());

    builder.push(" ORDER BY `r_link`.`t_order` ASC LIMIT 2");

    let query = builder.build_query_as::<TrackFileLinkMergedRow>();

    let track_rows = query.fetch_all(connection.deref_mut()).await?;

    match &track_rows[..] {
        [] => Ok(None),
        [curr] => {
            let track_time_offset = Duration::milliseconds(curr.link.time_offset);
            let track_position = *time_offset - track_time_offset;

            let track_row = {
                let mut builder = create_select_query_builder();
                builder.push(" WHERE `r_link`.`stream_id` = ");
                builder.push_bind(stream_id.deref());
                builder.push(" ORDER BY `r_link`.`t_order` ASC LIMIT 1");
                let query = builder.build_query_as::<TrackFileLinkMergedRow>();
                query.fetch_optional(connection.deref_mut()).await?
            };

            match track_row {
                Some(track_row) => Ok(Some((curr.clone(), track_row, track_position))),
                None => Ok(None),
            }
        }
        [curr, next, ..] => {
            let track_time_offset = Duration::milliseconds(curr.link.time_offset);
            let track_position = *time_offset - track_time_offset;

            Ok(Some((curr.clone(), next.clone(), track_position)))
        }
    }
}

#[tracing::instrument(err, skip(connection))]
pub(crate) async fn get_single_stream_track_by_link_id(
    connection: &mut MySqlConnection,
    stream_id: &StreamId,
    link_id: &LinkId,
) -> RepositoryResult<Option<TrackFileLinkMergedRow>> {
    let mut builder = create_select_query_builder();

    builder.push(" WHERE `r_link`.`stream_id` = ");
    builder.push_bind(stream_id.deref());

    builder.push(" AND `r_link`.`id` = ");
    builder.push_bind(link_id.deref());

    builder.push(" LIMIT 1");

    let query = builder.build_query_as::<TrackFileLinkMergedRow>();

    let optional_track = query.fetch_optional(connection.deref_mut()).await?;

    Ok(optional_track)
}

#[tracing::instrument(err, skip(connection))]
pub(crate) async fn get_single_stream_track_by_order_id(
    connection: &mut MySqlConnection,
    stream_id: &StreamId,
    order_id: &OrderId,
) -> RepositoryResult<Option<TrackFileLinkMergedRow>> {
    let mut builder = create_select_query_builder();

    builder.push(" WHERE `r_link`.`stream_id` = ");
    builder.push_bind(stream_id.deref());

    builder.push(" AND `r_link`.`t_order` = ");
    builder.push_bind(order_id.deref());

    builder.push(" LIMIT 1");

    let query = builder.build_query_as::<TrackFileLinkMergedRow>();

    let optional_track = query.fetch_optional(connection.deref_mut()).await?;

    Ok(optional_track)
}

#[tracing::instrument(err, skip(connection))]
pub(crate) async fn remove_tracks_by_track_id(
    connection: &mut MySqlConnection,
    track_id: &TrackId,
    stream_id: &StreamId,
) -> RepositoryResult<()> {
    query("DELETE FROM `r_links` WHERE `r_link`.`stream_id` = ? AND `r_link`.`track_id` = ?")
        .bind(stream_id.deref())
        .bind(track_id.deref())
        .execute(connection.deref_mut())
        .await?;

    Ok(())
}

#[tracing::instrument(err, skip(connection))]
pub(crate) async fn delete_track_by_link_id(
    connection: &mut MySqlConnection,
    link_id: &LinkId,
    stream_id: &StreamId,
) -> RepositoryResult<()> {
    query("DELETE FROM `r_links` WHERE `r_link`.`stream_id` = ? AND `r_link`.`id` = ?")
        .bind(stream_id.deref())
        .bind(link_id.deref())
        .execute(connection.deref_mut())
        .await?;

    Ok(())
}

#[tracing::instrument(err, skip(connection))]
pub(crate) async fn optimize_tracks_in_user_stream(
    mut connection: &mut MySqlConnection,
    stream_id: &StreamId,
) -> RepositoryResult<()> {
    let stream_track_rows = get_stream_tracks(
        &mut connection,
        stream_id,
        &GetUserStreamTracksParams::default(),
        &None,
        &None,
    )
    .await?;

    let mut current_t_order = 1;
    let mut current_accumulated_duration = 0;

    for stream_track_row in stream_track_rows.iter() {
        query("UPDATE `r_link` SET `t_order` = ?, `time_offset` = ? WHERE `id` = ?")
            .bind(current_t_order)
            .bind(current_accumulated_duration)
            .bind(&stream_track_row.link.id)
            .execute(connection.deref_mut())
            .await?;

        current_t_order += 1;
        current_accumulated_duration += stream_track_row.track.duration;
    }

    Ok(())
}
