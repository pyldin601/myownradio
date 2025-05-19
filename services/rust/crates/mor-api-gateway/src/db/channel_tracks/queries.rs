use crate::db::channel_tracks::model::ChannelTrack;
use crate::db::schema::r_link::dsl::r_link;
use crate::db::schema::r_link::{stream_id, t_order};
use diesel::prelude::*;
use diesel::result::Error;
use diesel::SelectableHelper;
use diesel_async::AsyncMysqlConnection;
use diesel_async::RunQueryDsl;

pub(crate) async fn get_all_by_channel_id(
    channel_id: i32,
    conn: &mut AsyncMysqlConnection,
) -> Result<Vec<ChannelTrack>, Error> {
    r_link
        .filter(stream_id.eq(channel_id))
        .select(ChannelTrack::as_select())
        .order_by(t_order)
        .load(conn)
        .await
}
