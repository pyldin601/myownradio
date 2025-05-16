use crate::db::schema::r_streams;
use diesel::{Insertable, Queryable, Selectable};
use serde::{Deserialize, Serialize};

#[derive(Clone, Serialize, Selectable, Queryable, Insertable)]
#[diesel(table_name = r_streams)]
#[diesel(check_for_backend(diesel::mysql::Mysql))]
#[allow(dead_code)]
pub(crate) struct Channel {
    #[diesel(column_name = "sid")]
    pub(crate) id: i32,
    #[diesel(column_name = "uid")]
    pub(crate) user_id: i32,
    pub(crate) name: String,
    pub(crate) permalink: Option<String>,
    pub(crate) info: String,
    pub(crate) jingle_interval: i32,
    pub(crate) status: i32,
    pub(crate) started: Option<i64>,
    pub(crate) started_from: Option<i64>,
    pub(crate) access: String,
    pub(crate) category: Option<i32>,
    pub(crate) hashtags: String,
    pub(crate) cover: Option<String>,
    pub(crate) cover_background: Option<String>,
    pub(crate) created: i64,
    pub(crate) rtmp_url: String,
    #[serde(skip_serializing)]
    pub(crate) rtmp_streaming_key: String,
}

#[derive(Deserialize)]
pub struct NewChannel {
    pub(crate) name: String,
    pub(crate) permalink: Option<String>,
    pub(crate) info: String,
    pub(crate) jingle_interval: i32,
    pub(crate) status: i32,
    pub(crate) started: Option<i64>,
    pub(crate) started_from: Option<i64>,
    pub(crate) access: String,
    pub(crate) category: Option<i32>,
    pub(crate) hashtags: String,
    pub(crate) cover: Option<String>,
    pub(crate) cover_background: Option<String>,
    pub(crate) created: i64,
    pub(crate) rtmp_url: String,
    pub(crate) rtmp_streaming_key: String,
}
