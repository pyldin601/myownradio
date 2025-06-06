use crate::db::channels::{Channel, ChannelInput};
use crate::db::schema::r_streams::dsl::*;
use diesel::prelude::*;
use diesel::result::Error;
use diesel::sql_types::Integer;
use diesel::SelectableHelper;
use diesel_async::RunQueryDsl;
use diesel_async::{AsyncConnection, AsyncMysqlConnection};

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

pub(crate) async fn create(
    new_channel: &ChannelInput,
    user_id: i32,
    conn: &mut AsyncMysqlConnection,
) -> Result<Channel, Error> {
    conn.transaction::<_, Error, _>(|trans| {
        Box::pin(async move {
            diesel::insert_into(r_streams)
                .values((uid.eq(&user_id), new_channel))
                .execute(trans)
                .await?;

            let last_id: i32 = diesel::dsl::sql::<Integer>("SELECT LAST_INSERT_ID()")
                .get_result(trans)
                .await?;

            let inserted_channel = r_streams
                .filter(sid.eq(last_id))
                .select(Channel::as_select())
                .first(trans)
                .await?;

            Ok(inserted_channel)
        })
    })
    .await
}

pub(crate) async fn update(
    channel_input: &ChannelInput,
    channel_id: i32,
    user_id: i32,
    conn: &mut AsyncMysqlConnection,
) -> Result<Option<Channel>, Error> {
    conn.transaction::<_, Error, _>(|trans| {
        Box::pin(async move {
            let rows_updated = diesel::update(r_streams)
                .filter(sid.eq(channel_id))
                .filter(uid.eq(user_id))
                .set(channel_input)
                .execute(trans)
                .await?;

            if rows_updated == 0 {
                return Ok(None);
            }

            let updated_channel = r_streams
                .filter(sid.eq(channel_id))
                .filter(uid.eq(user_id))
                .select(Channel::as_select())
                .first(trans)
                .await?;

            Ok(Some(updated_channel))
        })
    })
    .await
}

pub(crate) async fn delete(
    channel_id: i32,
    user_id: i32,
    conn: &mut AsyncMysqlConnection,
) -> Result<bool, Error> {
    let rows_deleted = diesel::delete(r_streams)
        .filter(sid.eq(channel_id))
        .filter(uid.eq(user_id))
        .execute(conn)
        .await?;

    Ok(rows_deleted == 1)
}
