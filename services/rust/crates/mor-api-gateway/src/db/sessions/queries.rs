use crate::db::schema::r_sessions::dsl as columns;
use crate::db::schema::r_sessions::dsl::r_sessions;
use crate::db::sessions::model::Session;
use diesel::prelude::*;
use diesel::result::Error;
use diesel_async::{AsyncMysqlConnection, RunQueryDsl};

pub(crate) async fn create(
    session: &Session,
    conn: &mut AsyncMysqlConnection,
) -> Result<(), Error> {
    diesel::insert_into(r_sessions)
        .values(session)
        .execute(conn)
        .await?;

    Ok(())
}

pub(crate) async fn delete(token: &str, conn: &mut AsyncMysqlConnection) -> Result<(), Error> {
    diesel::delete(r_sessions)
        .filter(columns::token.eq(token))
        .execute(conn)
        .await?;

    Ok(())
}
