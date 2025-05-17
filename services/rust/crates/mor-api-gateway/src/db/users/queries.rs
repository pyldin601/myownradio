use crate::db::schema::r_users::dsl::*;
use crate::db::users::model::User;
use crate::db::users::UserInput;
use diesel::prelude::*;
use diesel::result::Error;
use diesel::sql_types::Integer;
use diesel::SelectableHelper;
use diesel_async::RunQueryDsl;
use diesel_async::{AsyncConnection, AsyncMysqlConnection};

pub(crate) async fn list_all(conn: &mut AsyncMysqlConnection) -> Result<Vec<User>, Error> {
    r_users.select(User::as_select()).load(conn).await
}

pub(crate) async fn get_by_id(
    user_id: i32,
    conn: &mut AsyncMysqlConnection,
) -> Result<Option<User>, Error> {
    match r_users
        .filter(uid.eq(user_id))
        .select(User::as_select())
        .first(conn)
        .await
    {
        Ok(user) => Ok(Some(user)),
        Err(Error::NotFound) => Ok(None),
        Err(e) => Err(e),
    }
}

pub(crate) async fn get_by_login_and_password(
    input_login: &str,
    input_password: &str,
    conn: &mut AsyncMysqlConnection,
) -> Result<Option<User>, Error> {
    match r_users
        .filter(login.eq(input_login))
        .filter(password.eq(input_password))
        .select(User::as_select())
        .first(conn)
        .await
    {
        Ok(user) => Ok(Some(user)),
        Err(Error::NotFound) => Ok(None),
        Err(e) => Err(e),
    }
}

pub(crate) async fn create(
    user_input: &UserInput,
    conn: &mut AsyncMysqlConnection,
) -> Result<User, Error> {
    conn.transaction::<_, Error, _>(|trans| {
        Box::pin(async move {
            diesel::insert_into(r_users)
                .values(user_input)
                .execute(trans)
                .await?;

            let last_id: i32 = diesel::dsl::sql::<Integer>("SELECT LAST_INSERT_ID()")
                .get_result(trans)
                .await?;

            let inserted_track = r_users
                .filter(uid.eq(last_id))
                .select(User::as_select())
                .first(trans)
                .await?;

            Ok(inserted_track)
        })
    })
    .await
}

pub(crate) async fn update(
    id: i32,
    user_input: &UserInput,
    conn: &mut AsyncMysqlConnection,
) -> Result<Option<User>, Error> {
    conn.transaction::<_, Error, _>(|trans| {
        Box::pin(async move {
            let rows_updated = diesel::update(r_users)
                .filter(uid.eq(id))
                .set(user_input)
                .execute(trans)
                .await?;

            if rows_updated == 0 {
                return Ok(None);
            }

            let updated_track = r_users
                .filter(uid.eq(id))
                .select(User::as_select())
                .first(trans)
                .await?;

            Ok(Some(updated_track))
        })
    })
    .await
}

pub(crate) async fn delete(id: i32, conn: &mut AsyncMysqlConnection) -> Result<bool, Error> {
    let rows_deleted = diesel::delete(r_users)
        .filter(uid.eq(id))
        .execute(conn)
        .await?;

    Ok(rows_deleted == 1)
}
