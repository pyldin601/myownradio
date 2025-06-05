use crate::response::Response;
use actix_web::HttpResponse;
use web_user_identity::UserId;

pub(crate) async fn list_tracks(user_id: UserId) -> Response {
    Ok(HttpResponse::NotImplemented().finish())
}

pub(crate) async fn list_unused_tracks(user_id: UserId) -> Response {
    Ok(HttpResponse::NotImplemented().finish())
}

pub(crate) async fn search_tracks(user_id: UserId) -> Response {
    Ok(HttpResponse::NotImplemented().finish())
}

pub(crate) async fn upload_track(user_id: UserId) -> Response {
    Ok(HttpResponse::NotImplemented().finish())
}

pub(crate) async fn add_to_channel(user_id: UserId) -> Response {
    Ok(HttpResponse::NotImplemented().finish())
}

pub(crate) async fn change_color(user_id: UserId) -> Response {
    Ok(HttpResponse::NotImplemented().finish())
}

pub(crate) async fn edit_multiple_tracks(user_id: UserId) -> Response {
    Ok(HttpResponse::NotImplemented().finish())
}

pub(crate) async fn delete_multiple_tracks(user_id: UserId) -> Response {
    Ok(HttpResponse::NotImplemented().finish())
}

pub(crate) async fn download(user_id: UserId) -> Response {
    Ok(HttpResponse::NotImplemented().finish())
}

pub(crate) async fn preview(user_id: UserId) -> Response {
    Ok(HttpResponse::NotImplemented().finish())
}
