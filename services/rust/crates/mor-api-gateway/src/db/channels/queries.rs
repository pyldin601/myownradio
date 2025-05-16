use crate::db::channels::model::Channel;
use crate::db::schema::r_streams::dsl::{r_streams, sid, uid};
use diesel::prelude::*;
use diesel::result::Error;
use diesel::SelectableHelper;
use diesel_async::AsyncMysqlConnection;
use diesel_async::RunQueryDsl;

pub(crate) async fn get_all_by_user_id(
    user_id: i32,
    conn: &mut AsyncMysqlConnection,
) -> Result<Vec<Channel>, Error> {
    r_streams
        .filter(uid.eq(user_id))
        .select(Channel::as_select())
        .load(conn)
        .await
}

pub(crate) async fn get_one_by_id_and_user_id(
    id: i32,
    user_id: i32,
    conn: &mut AsyncMysqlConnection,
) -> Result<Option<Channel>, Error> {
    match r_streams
        .filter(sid.eq(id))
        .filter(uid.eq(user_id))
        .select(Channel::as_select())
        .first(conn)
        .await
    {
        Ok(channel) => Ok(Some(channel)),
        Err(Error::NotFound) => Ok(None),
        Err(e) => Err(e),
    }
}
