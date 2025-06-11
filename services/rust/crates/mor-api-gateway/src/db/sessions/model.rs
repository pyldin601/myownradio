use crate::db::schema::r_sessions;
use chrono::NaiveDateTime;
use diesel::{Insertable, Queryable, Selectable};

#[derive(Clone, Selectable, Queryable, Insertable)]
#[diesel(table_name = r_sessions)]
#[diesel(primary_key(token))]
#[diesel(belongs_to(User, foreign_key = uid))]
#[diesel(check_for_backend(diesel::mysql::Mysql))]
#[allow(dead_code)]
pub(crate) struct Session {
    pub(crate) uid: i32,
    pub(crate) ip: String,
    pub(crate) token: String,
    pub(crate) client_id: String,
    pub(crate) authorized: NaiveDateTime,
    pub(crate) http_user_agent: String,
    pub(crate) session_id: String,
    pub(crate) permanent: i8,
    pub(crate) expires: Option<NaiveDateTime>,
}
