use crate::response::Response;
use actix_web::HttpResponse;

pub(crate) async fn get_file() -> Response {
    Ok(HttpResponse::Ok().finish())
}

pub(crate) async fn delete_file() -> Response {
    Ok(HttpResponse::Ok().finish())
}

pub(crate) async fn update_file() -> Response {
    Ok(HttpResponse::Ok().finish())
}

pub(crate) async fn add_file() -> Response {
    Ok(HttpResponse::Ok().finish())
}
