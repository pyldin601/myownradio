use crate::db::{tracks, DbPool};
use crate::response::{Error, Response};
use actix_web::{web, HttpResponse};

pub(crate) async fn list_tracks(user_id: web::Path<i32>, pool: web::Data<DbPool>) -> Response {
    let user_id = user_id.into_inner();
    let mut conn = pool.get_connection().await?;
    let tracks = tracks::get_all_by_user_id(user_id, &mut conn).await?;

    Ok(HttpResponse::Ok().json(tracks))
}

pub(crate) async fn get_track(path: web::Path<(i32, i32)>, pool: web::Data<DbPool>) -> Response {
    let (user_id, track_id) = path.into_inner();
    let mut conn = pool.get_connection().await?;
    let track = tracks::get_one_by_id_and_user_id(track_id, user_id, &mut conn)
        .await?
        .ok_or(Error::EntityNotFound)?;

    Ok(HttpResponse::Ok().json(track))
}

pub(crate) async fn update_track(
    track_input: web::Json<tracks::TrackInput>,
    path: web::Path<(i32, i32)>,
    pool: web::Data<DbPool>,
) -> Response {
    let (user_id, track_id) = path.into_inner();
    let mut conn = pool.get_connection().await?;
    let track = tracks::update(&track_input, track_id, user_id, &mut conn)
        .await?
        .ok_or(Error::EntityNotFound)?;

    Ok(HttpResponse::Ok().json(track))
}

pub(crate) async fn create_track(
    track_input: web::Json<tracks::TrackInput>,
    user_id: web::Path<i32>,
    pool: web::Data<DbPool>,
) -> Response {
    let user_id = user_id.into_inner();
    let mut conn = pool.get_connection().await?;
    let track = tracks::create(&track_input, user_id, &mut conn).await?;

    Ok(HttpResponse::Ok().json(track))
}

pub(crate) async fn delete_track(path: web::Path<(i32, i32)>, pool: web::Data<DbPool>) -> Response {
    let (user_id, track_id) = path.into_inner();
    let mut conn = pool.get_connection().await?;

    match tracks::delete(track_id, user_id, &mut conn).await? {
        true => Ok(HttpResponse::Accepted().finish()),
        false => Err(Error::EntityNotFound),
    }
}
