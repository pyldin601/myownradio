use crate::db::channels::Channel;
use crate::db::schema::r_link;
use crate::db::tracks::Track;
use diesel::{AsChangeset, Associations, Insertable, Queryable, Selectable};
use serde::{Deserialize, Serialize};

#[allow(dead_code)]
#[derive(Clone, Serialize, Selectable, Queryable, Insertable, Associations)]
#[diesel(table_name = r_link)]
#[diesel(belongs_to(Track, foreign_key = track_id))]
#[diesel(belongs_to(Channel, foreign_key = stream_id))]
#[diesel(check_for_backend(diesel::mysql::Mysql))]
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

#[derive(Serialize, Queryable)]
pub(crate) struct ChannelTrackWithTrack {
    #[diesel(column_name = "t_order")]
    pub(crate) position: i32,
    pub(crate) unique_id: String,
    pub(crate) time_offset: i64,
    #[serde(flatten)]
    pub(crate) track: Track,
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
