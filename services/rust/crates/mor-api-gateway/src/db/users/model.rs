use crate::db::schema::r_users;
use diesel::{AsChangeset, Insertable, Queryable, Selectable};
use serde::{Deserialize, Serialize};

#[derive(Clone, Serialize, Selectable, Queryable)]
#[diesel(table_name = r_users)]
#[diesel(check_for_backend(diesel::mysql::Mysql))]
#[allow(dead_code)]
pub(crate) struct User {
    uid: i32,
    mail: String,
    login: Option<String>,
    pub(crate) password: Option<String>,
    name: Option<String>,
    country_id: Option<i32>,
    info: Option<String>,
    rights: Option<i32>,
    registration_date: u32,
    last_visit_date: Option<u32>,
    permalink: Option<String>,
    avatar: Option<String>,
    is_enabled: i8,
}

#[derive(Deserialize, AsChangeset, Insertable)]
#[diesel(table_name = r_users)]
pub(crate) struct UserInput {
    mail: String,
    login: Option<String>,
    password: Option<String>,
    name: Option<String>,
    country_id: Option<i32>,
    info: Option<String>,
    rights: Option<i32>,
    registration_date: u32,
    last_visit_date: Option<u32>,
    permalink: Option<String>,
    avatar: Option<String>,
    is_enabled: i8,
}
