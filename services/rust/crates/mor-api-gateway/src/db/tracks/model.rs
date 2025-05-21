use crate::db::schema::r_tracks;
use diesel::{AsChangeset, Identifiable, Insertable, Queryable, Selectable};
use serde::{Deserialize, Serialize};

#[allow(dead_code)]
#[derive(Clone, Serialize, Selectable, Queryable, Identifiable)]
#[diesel(primary_key(tid))]
#[diesel(table_name = r_tracks)]
#[diesel(check_for_backend(diesel::mysql::Mysql))]
pub(crate) struct Track {
    #[diesel(column_name = "tid")]
    pub(crate) id: i32,
    #[diesel(column_name = "uid")]
    pub(crate) user_id: i32,
    pub(crate) file_id: Option<i32>,
    pub(crate) filename: String,
    pub(crate) hash: String,
    pub(crate) ext: String,
    pub(crate) artist: String,
    pub(crate) title: String,
    pub(crate) album: String,
    pub(crate) track_number: String,
    pub(crate) genre: String,
    pub(crate) date: String,
    pub(crate) cue: Option<String>,
    pub(crate) buy: Option<String>,
    pub(crate) duration: i32,
    pub(crate) filesize: i32,
    pub(crate) color: i32,
    pub(crate) uploaded: i32,
    pub(crate) copy_of: Option<i32>,
    pub(crate) used_count: i32,
    pub(crate) is_new: i8,
    pub(crate) can_be_shared: i8,
    pub(crate) is_deleted: i8,
    pub(crate) deleted: Option<i32>,
}

#[derive(Deserialize, AsChangeset, Insertable)]
#[diesel(table_name = r_tracks)]
pub(crate) struct TrackInput {
    pub(crate) file_id: Option<i32>,
    pub(crate) filename: String,
    pub(crate) hash: String,
    pub(crate) ext: String,
    pub(crate) artist: String,
    pub(crate) title: String,
    pub(crate) album: String,
    pub(crate) track_number: String,
    pub(crate) genre: String,
    pub(crate) date: String,
    pub(crate) cue: Option<String>,
    pub(crate) buy: Option<String>,
    pub(crate) duration: i32,
    pub(crate) filesize: i32,
    pub(crate) color: i32,
    pub(crate) uploaded: i32,
    pub(crate) copy_of: Option<i32>,
    pub(crate) used_count: i32,
    pub(crate) is_new: i8,
    pub(crate) can_be_shared: i8,
    pub(crate) is_deleted: i8,
    pub(crate) deleted: Option<i32>,
}
