use crate::db::channels::{Channel, NewChannel};
use crate::db::schema::r_streams::{dsl::*, name};
use diesel::insert_into;
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
    new_channel: &NewChannel,
    user_id: i32,
    conn: &mut AsyncMysqlConnection,
) -> Result<Channel, Error> {
    conn.transaction::<_, Error, _>(|trans| {
        Box::pin(async move {
            insert_into(r_streams)
                .values((
                    uid.eq(&user_id),
                    name.eq(&new_channel.name),
                    permalink.eq(&new_channel.permalink),
                    info.eq(&new_channel.info),
                    jingle_interval.eq(&new_channel.jingle_interval),
                    status.eq(&new_channel.status),
                    started.eq(&new_channel.started),
                    started_from.eq(&new_channel.started_from),
                    access.eq(&new_channel.access),
                    category.eq(&new_channel.category),
                    hashtags.eq(&new_channel.hashtags),
                    cover.eq(&new_channel.cover),
                    cover_background.eq(&new_channel.cover_background),
                    created.eq(&new_channel.created),
                    rtmp_url.eq(&new_channel.rtmp_url),
                    rtmp_streaming_key.eq(&new_channel.rtmp_streaming_key),
                ))
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
