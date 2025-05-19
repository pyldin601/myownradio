use crate::db::schema::r_link;
use diesel::{AsChangeset, Insertable, Queryable, Selectable};
use serde::{Deserialize, Serialize};

#[derive(Clone, Serialize, Selectable, Queryable, Insertable)]
#[diesel(table_name = r_link)]
#[diesel(check_for_backend(diesel::mysql::Mysql))]
#[allow(dead_code)]
pub(crate) struct ChannelTrack {
    pub(crate) id: i64,
    #[diesel(column_name = "stream_id")]
    pub(crate) channel_id: i32,
    pub(crate) track_id: i32,
    #[diesel(column_name = "t_order")]
    pub(crate) position: i32,
    pub(crate) unique_id: String,
    pub(crate) time_offset: i64,
}

#[derive(Deserialize, AsChangeset, Insertable)]
#[diesel(table_name = r_link)]
pub(crate) struct ChannelTrackInput {
    #[diesel(column_name = "stream_id")]
    pub(crate) channel_id: i32,
    pub(crate) track_id: i32,
    #[diesel(column_name = "t_order")]
    pub(crate) position: i32,
    pub(crate) unique_id: String,
    pub(crate) time_offset: i64,
}
