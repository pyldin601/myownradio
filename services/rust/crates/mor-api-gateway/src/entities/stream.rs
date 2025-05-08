use select_fields_derive::SelectFields;
use serde::Serialize;
use serde_repr::Serialize_repr;

#[derive(sqlx::Type, Clone, Serialize_repr)]
#[repr(i64)]
pub(crate) enum StreamStatus {
    Stopped = 0,
    Playing = 1,
    Paused = 2,
}

#[derive(sqlx::FromRow, Clone, Serialize, SelectFields)]
pub(crate) struct StreamRow {
    #[serde(rename = "id")]
    pub(crate) sid: i64,
    #[serde(skip)]
    pub(crate) uid: i64,
    pub(crate) name: String,
    pub(crate) permalink: Option<String>,
    pub(crate) info: String,
    pub(crate) jingle_interval: i64,
    pub(crate) status: StreamStatus,
    pub(crate) started: Option<i64>,
    pub(crate) started_from: Option<i64>,
    pub(crate) access: String,
    pub(crate) category: Option<i64>,
    pub(crate) hashtags: String,
    pub(crate) cover: Option<String>,
    pub(crate) cover_background: Option<String>,
    pub(crate) created: i64,
    pub(crate) rtmp_url: String,
    #[serde(skip_serializing)]
    pub(crate) rtmp_streaming_key: String,
}
