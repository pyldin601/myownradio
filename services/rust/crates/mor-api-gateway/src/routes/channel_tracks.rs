use crate::response::Response;
use actix_web::HttpResponse;

pub(crate) async fn list_tracks() -> Response {
    Ok(HttpResponse::NotImplemented().finish())
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
