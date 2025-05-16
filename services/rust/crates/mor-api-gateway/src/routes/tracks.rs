use crate::db::DbPool;
use crate::response::Response;
use actix_web::{web, HttpResponse};

pub(crate) async fn list_tracks(user_id: web::Path<i32>, pool: web::Data<DbPool>) -> Response {
    let user_id = user_id.into_inner();

    let mut conn = pool.get_connection().await?;

    Ok(HttpResponse::NotImplemented().finish())
}

pub(crate) async fn get_track(path: web::Path<(i32, i32)>, pool: web::Data<DbPool>) -> Response {
    let (user_id, track_id) = path.into_inner();

    let mut conn = pool.get_connection().await?;

    Ok(HttpResponse::NotImplemented().finish())
}

pub(crate) async fn update_track(path: web::Path<(i32, i32)>, pool: web::Data<DbPool>) -> Response {
    let (user_id, track_id) = path.into_inner();

    let mut conn = pool.get_connection().await?;

    Ok(HttpResponse::NotImplemented().finish())
}

pub(crate) async fn create_track(user_id: web::Path<i32>, pool: web::Data<DbPool>) -> Response {
    let user_id = user_id.into_inner();

    let mut conn = pool.get_connection().await?;

    Ok(HttpResponse::NotImplemented().finish())
}

pub(crate) async fn delete_track(path: web::Path<(i32, i32)>, pool: web::Data<DbPool>) -> Response {
    let (user_id, track_id) = path.into_inner();

    let mut conn = pool.get_connection().await?;

    Ok(HttpResponse::NotImplemented().finish())
}
