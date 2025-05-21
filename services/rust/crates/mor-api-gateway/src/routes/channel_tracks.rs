use crate::db::{channel_tracks, channels, DbPool};
use crate::response::{Error, Response};
use actix_web::{web, HttpResponse};

pub(crate) async fn list_tracks(path: web::Path<(i32, i32)>, pool: web::Data<DbPool>) -> Response {
    let (user_id, channel_id) = path.into_inner();
    let mut conn = pool.get_connection().await?;

    let _ = channels::get_one_by_id_and_user_id(channel_id, user_id, &mut conn)
        .await?
        .ok_or(Error::EntityNotFound)?;

    let channel_tracks =
        channel_tracks::get_channel_tracks_with_tracks(channel_id, &mut conn).await?;

    Ok(HttpResponse::Ok().json(channel_tracks))
}

pub(crate) async fn add_track() -> Response {
    Ok(HttpResponse::NotImplemented().finish())
}

pub(crate) async fn delete_track() -> Response {
    Ok(HttpResponse::NotImplemented().finish())
}

pub(crate) async fn reorder_track() -> Response {
    Ok(HttpResponse::NotImplemented().finish())
}
