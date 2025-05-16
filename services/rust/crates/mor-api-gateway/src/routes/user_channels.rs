use crate::db::{channels, DbPool};
use crate::response::{Error, Response};
use actix_web::{web, HttpResponse};

pub(crate) async fn list_user_channels(
    user_id: web::Path<i32>,
    pool: web::Data<DbPool>,
) -> Response {
    let user_id = user_id.into_inner();
    let mut conn = pool.get_connection().await?;

    let channels = channels::get_all_by_user_id(user_id, &mut conn).await?;

    Ok(HttpResponse::Ok().json(channels))
}

pub(crate) async fn get_user_channel(
    path: web::Path<(i32, i32)>,
    pool: web::Data<DbPool>,
) -> Response {
    let (user_id, channel_id) = path.into_inner();

    let mut conn = pool.get_connection().await?;

    let channel = channels::get_one_by_id_and_user_id(channel_id, user_id, &mut conn)
        .await?
        .ok_or(Error::EntityNotFound)?;

    Ok(HttpResponse::Ok().json(channel))
}

pub(crate) async fn update_user_channel(
    channel: web::Json<channels::ChannelInput>,
    path: web::Path<(i32, i32)>,
    pool: web::Data<DbPool>,
) -> Response {
    let (user_id, channel_id) = path.into_inner();
    let channel = channel.into_inner();

    let mut conn = pool.get_connection().await?;

    let channel = channels::update(&channel, channel_id, user_id, &mut conn)
        .await?
        .ok_or(Error::EntityNotFound)?;

    Ok(HttpResponse::Ok().json(channel))
}

pub(crate) async fn create_user_channel(
    channel: web::Json<channels::ChannelInput>,
    user_id: web::Path<i32>,
    pool: web::Data<DbPool>,
) -> Response {
    let user_id = user_id.into_inner();
    let channel = channel.into_inner();

    let mut conn = pool.get_connection().await?;

    let channel = channels::create(&channel, user_id, &mut conn).await?;

    Ok(HttpResponse::Ok().json(channel))
}

pub(crate) async fn delete_user_channel(
    path: web::Path<(i32, i32)>,
    pool: web::Data<DbPool>,
) -> Response {
    let (user_id, channel_id) = path.into_inner();

    let mut conn = pool.get_connection().await?;

    match channels::delete(channel_id, user_id, &mut conn).await? {
        true => Ok(HttpResponse::Accepted().finish()),
        false => Err(Error::EntityNotFound),
    }
}
