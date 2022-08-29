use crate::models::audio_track::{AudioTrack, StreamTracksEntry};
use crate::models::types::{StreamId, UserId};
use crate::mysql_client::MySqlClient;
use serde_repr::{Deserialize_repr, Serialize_repr};
use sqlx::{query, query_as, Database, Error, Execute, Executor, MySql, QueryBuilder, Row, Type};
use std::ops::Deref;
use tracing::trace;

// Copied from Defaults.php
const DEFAULT_TRACKS_PER_REQUEST: i64 = 50;

#[derive(Serialize_repr, Deserialize_repr)]
#[repr(u8)]
pub(crate) enum SortingColumn {
    TrackId,
    Title,
    Artist,
    Genre,
    Duration,
}

impl Default for SortingColumn {
    fn default() -> Self {
        Self::TrackId
    }
}

impl SortingColumn {
    fn as_str(&self) -> &str {
        match self {
            SortingColumn::TrackId => "tid",
            SortingColumn::Title => "title",
            SortingColumn::Artist => "artist",
            SortingColumn::Genre => "genre",
            SortingColumn::Duration => "duration",
        }
    }
}

#[derive(Serialize_repr, Deserialize_repr)]
#[repr(u8)]
pub(crate) enum SortingOrder {
    Desc,
    Asc,
}

impl Default for SortingOrder {
    fn default() -> Self {
        Self::Desc
    }
}

impl SortingOrder {
    fn as_str(&self) -> &str {
        match self {
            SortingOrder::Desc => "DESC",
            SortingOrder::Asc => "ASC",
        }
    }
}

fn create_stream_audio_tracks_builder(stream_id: &StreamId) -> QueryBuilder<MySql> {
    let mut builder = QueryBuilder::new(
        "SELECT `r_tracks`.*, `r_link`.*, `fs_file`.`file_hash`, `fs_file`.`file_size`, `fs_file`.`file_extension`"
    );
    builder.push(" FROM `r_tracks` JOIN `r_link` ON `r_tracks`.`tid` = `r_link`.`track_id`");
    builder.push(" JOIN `fs_file` ON `fs_file`.`file_id` = `r_tracks`.`file_id`");
    builder.push(" WHERE `r_link`.`stream_id` = ");
    builder.push_bind(stream_id.deref());

    builder
}

pub(crate) async fn get_user_audio_tracks<'e, E>(
    executor: E,
    user_id: &UserId,
    color: &Option<u32>,
    filter: &Option<String>,
    offset: &u32,
    unused: &bool,
    sorting_column: &SortingColumn,
    sorting_order: &SortingOrder,
) -> Result<Vec<AudioTrack>, Error>
where
    E: Executor<'e, Database = MySql>,
{
    let mut builder = QueryBuilder::new(
        "SELECT `r_tracks`.*, `fs_file`.`file_hash`, `fs_file`.`file_size`, `fs_file`.`file_extension`
            FROM `r_tracks` JOIN `fs_file` ON `fs_file`.`file_id` = `r_tracks`.`file_id`",
    );

    builder.push(" WHERE uid = ");
    builder.push_bind(user_id.deref());

    if let Some(filter) = filter {
        if !filter.is_empty() {
            builder.push(" AND MATCH(artist, title, genre) AGAINST (");
            builder.push_bind(filter);
            builder.push(" IN BOOLEAN MODE)");
        }
    };

    if let Some(color) = color {
        builder.push(" AND color = ");
        builder.push_bind(color);
    };

    if *unused {
        builder.push(" AND used_count = 0");
    }

    builder.push(format_args!(
        " ORDER BY {} {}",
        sorting_column.as_str(),
        sorting_order.as_str()
    ));

    builder.push(" LIMIT ");
    builder.push_bind(offset);
    builder.push(", ");
    builder.push_bind(DEFAULT_TRACKS_PER_REQUEST);

    let query = builder.build();

    trace!("Running SQL query: {}", query.sql());

    let audio_tracks = query
        .fetch_all(executor)
        .await
        .map(|rows| rows.iter().map(Into::into).collect())?;

    Ok(audio_tracks)
}

pub(crate) async fn get_stream_audio_tracks_duration<'e, E>(
    executor: E,
    stream_id: &StreamId,
) -> Result<i64, Error>
where
    E: Executor<'e, Database = MySql>,
{
    let mut builder =
        QueryBuilder::new("SELECT CAST(SUM(`r_tracks`.`duration`) AS SIGNED) as `sum`");

    builder.push(" FROM `r_tracks` JOIN `r_link` ON `r_tracks`.`tid` = `r_link`.`track_id`");

    builder.push(" WHERE `r_link`.`stream_id` = ");
    builder.push_bind(stream_id.deref());

    let query = builder.build();

    trace!("Running SQL query: {}", query.sql());

    let tracks_duration = query
        .fetch_one(executor)
        .await
        .map(|row| row.get::<Option<i64>, _>("sum"))?;

    Ok(tracks_duration.unwrap_or_default())
}

pub(crate) async fn get_audio_track_at_offset<'e, E>(
    executor: E,
    stream_id: &StreamId,
    time_offset: &i64,
) -> Result<Option<StreamTracksEntry>, Error>
where
    E: Executor<'e, Database = MySql> + Clone,
{
    let tracks_duration =
        match get_stream_audio_tracks_duration(executor.clone(), stream_id).await? {
            0 => return Ok(None),
            duration => duration,
        };

    let mut builder = create_stream_audio_tracks_builder(stream_id);

    builder.push(" AND `r_link`.`time_offset` + `r_tracks`.`duration` >= ");
    builder.push_bind(time_offset % tracks_duration);
    builder.push(" ORDER BY `r_link`.`t_order` LIMIT 1");

    let query = builder.build();

    trace!("Running SQL query: {}", query.sql());

    query
        .fetch_optional(executor)
        .await
        .map(|row| row.as_ref().map(Into::into))
}

pub(crate) async fn get_current_and_next_audio_tracks_at_offset<'e, E>(
    executor: E,
    stream_id: &StreamId,
    time_offset: &i64,
) -> Result<Option<(StreamTracksEntry, StreamTracksEntry)>, Error>
where
    E: Executor<'e, Database = MySql> + Clone,
{
    let mut builder = create_stream_audio_tracks_builder(stream_id);

    builder.push(" AND `r_link`.`time_offset` + `r_tracks`.`duration` >= ");
    builder.push_bind(time_offset);

    builder.push(" ORDER BY `r_link`.`t_order` LIMIT 2");

    let query = builder.build();

    trace!("Running SQL query: {}", query.sql());

    let audio_tracks: Vec<StreamTracksEntry> = query
        .fetch_all(executor.clone())
        .await
        .map(|rows| rows.iter().map(Into::into).collect())?;

    match audio_tracks.len() {
        0 => return Ok(None),
        1 => {
            // In case if it's the last track in tracklist, next track will be the first in tracklist
            let mut builder = create_stream_audio_tracks_builder(stream_id);
            builder.push(" ORDER BY `r_link`.`t_order` LIMIT 1");
            let query = builder.build();

            trace!("Running SQL query: {}", query.sql());

            let audio_track = query.fetch_one(executor).await.map(|ref row| row.into())?;

            Ok(Some((audio_tracks[0].clone(), audio_track)))
        }
        _ => Ok(Some((audio_tracks[0].clone(), audio_tracks[1].clone()))),
    }
}

pub(crate) async fn get_user_stream_audio_tracks<'e, E>(
    executor: E,
    user_id: &UserId,
    stream_id: &StreamId,
    color: &Option<u32>,
    filter: &Option<String>,
    offset: &u32,
) -> Result<Vec<StreamTracksEntry>, Error>
where
    E: Executor<'e, Database = MySql>,
{
    let mut builder = create_stream_audio_tracks_builder(stream_id);

    builder.push(" AND `r_tracks`.`uid` = ");
    builder.push_bind(user_id.deref());

    if let Some(filter) = filter {
        if !filter.is_empty() {
            builder.push(" AND MATCH(artist, title, genre) AGAINST (");
            builder.push_bind(filter);
            builder.push(" IN BOOLEAN MODE)");
        }
    };

    if let Some(color) = color {
        builder.push(" AND color = ");
        builder.push_bind(color);
    };

    builder.push(" ORDER BY `r_link`.`t_order`");

    builder.push(" LIMIT ");
    builder.push_bind(offset);
    builder.push(", ");
    builder.push_bind(DEFAULT_TRACKS_PER_REQUEST);

    let query = builder.build();

    trace!("Running SQL query: {}", query.sql());

    let audio_tracks = query
        .fetch_all(executor)
        .await
        .map(|rows| rows.iter().map(Into::into).collect())?;

    Ok(audio_tracks)
}
