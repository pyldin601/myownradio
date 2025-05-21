use crate::db::channel_tracks::model::ChannelTrackWithTrack;
use crate::db::schema::r_link::dsl::r_link;
use crate::db::schema::r_link::{stream_id, t_order, time_offset, unique_id};
use crate::db::schema::r_tracks::dsl::r_tracks;
use crate::db::tracks::Track;
use diesel::prelude::*;
use diesel::result::Error;
use diesel::SelectableHelper;
use diesel_async::AsyncMysqlConnection;
use diesel_async::RunQueryDsl;

pub(crate) async fn get_channel_tracks_with_tracks(
    channel_id: i32,
    conn: &mut AsyncMysqlConnection,
) -> Result<Vec<ChannelTrackWithTrack>, Error> {
    let rows = r_link
        .inner_join(r_tracks)
        .filter(stream_id.eq(channel_id))
        .select((t_order, unique_id, time_offset, Track::as_select()))
        .order_by(t_order)
        .load(conn)
        .await?;

    Ok(rows)
}
