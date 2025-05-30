use crate::db::schema::fs_file;
use diesel::{AsChangeset, Insertable, Queryable, Selectable};
use serde::{Deserialize, Serialize};

#[derive(Clone, Serialize, Selectable, Queryable, Insertable)]
#[diesel(table_name = fs_file)]
#[diesel(check_for_backend(diesel::mysql::Mysql))]
#[allow(dead_code)]
pub(crate) struct File {
    #[diesel(column_name = "file_id")]
    pub(crate) id: i32,
    pub(crate) file_size: i64,
    pub(crate) file_hash: String,
    pub(crate) file_extension: String,
    pub(crate) server_id: i32,
    pub(crate) use_count: i32,
}

#[derive(Deserialize, AsChangeset, Insertable)]
#[diesel(table_name = fs_file)]
pub(crate) struct FileInput {
    pub(crate) file_size: i64,
    pub(crate) file_hash: String,
    pub(crate) file_extension: String,
    pub(crate) server_id: i32,
    pub(crate) use_count: i32,
}
