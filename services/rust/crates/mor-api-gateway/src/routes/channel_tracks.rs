use crate::db::{channel_tracks, DbPool};
use crate::response::Response;
use actix_web::{web, HttpResponse};

pub(crate) async fn list_tracks(path: web::Path<(i32, i32)>, pool: web::Data<DbPool>) -> Response {
    let (user_id, channel_id) = path.into_inner();
    let mut conn = pool.get_connection().await?;

    let channels = channel_tracks::get_all_by_channel_id(channel_id, &mut conn).await?;

    Ok(HttpResponse::Ok().json(channels))
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
