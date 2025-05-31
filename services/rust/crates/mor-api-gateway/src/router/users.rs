use crate::db::users::UserInput;
use crate::db::{users, DbPool};
use crate::response::{Error, Response};
use actix_web::{web, HttpResponse};

pub(crate) async fn list_users(pool: web::Data<DbPool>) -> Response {
    let mut conn = pool.get_connection().await?;
    let users = users::list_all(&mut conn).await?;

    Ok(HttpResponse::Ok().json(users))
}

pub(crate) async fn get_user(path: web::Path<i32>, pool: web::Data<DbPool>) -> Response {
    let user_id = path.into_inner();
    let mut conn = pool.get_connection().await?;
    let user = users::get_by_id(user_id, &mut conn)
        .await?
        .ok_or(Error::EntityNotFound)?;

    Ok(HttpResponse::Ok().json(user))
}

pub(crate) async fn get_user_by_email(
    path: web::Path<String>,
    pool: web::Data<DbPool>,
) -> Response {
    let email = path.into_inner();
    let mut conn = pool.get_connection().await?;
    let user = users::get_by_email(&email, &mut conn)
        .await?
        .ok_or(Error::EntityNotFound)?;

    Ok(HttpResponse::Ok().json(user))
}

pub(crate) async fn create_user(json: web::Json<UserInput>, pool: web::Data<DbPool>) -> Response {
    let user_input = json.into_inner();
    let mut conn = pool.get_connection().await?;

    let user = users::create(&user_input, &mut conn).await?;

    Ok(HttpResponse::Ok().json(user))
}

pub(crate) async fn update_user(
    path: web::Path<i32>,
    json: web::Json<UserInput>,
    pool: web::Data<DbPool>,
) -> Response {
    let user_id = path.into_inner();
    let user_input = json.into_inner();
    let mut conn = pool.get_connection().await?;

    let user = users::update(user_id, &user_input, &mut conn)
        .await?
        .ok_or(Error::EntityNotFound)?;

    Ok(HttpResponse::Ok().json(user))
}

pub(crate) async fn delete_user(path: web::Path<i32>, pool: web::Data<DbPool>) -> Response {
    let user_id = path.into_inner();
    let mut conn = pool.get_connection().await?;

    match users::delete(user_id, &mut conn).await? {
        true => Ok(HttpResponse::Accepted().finish()),
        false => Err(Error::EntityNotFound),
    }
}
