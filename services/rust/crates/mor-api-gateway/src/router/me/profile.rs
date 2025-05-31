use crate::response::Response;
use actix_web::HttpResponse;

pub(crate) async fn get_profile() -> Response {
    Ok(HttpResponse::NotImplemented().finish())
}

pub(crate) async fn update_profile() -> Response {
    Ok(HttpResponse::NotImplemented().finish())
}

pub(crate) async fn update_picture() -> Response {
    Ok(HttpResponse::NotImplemented().finish())
}

pub(crate) async fn change_password() -> Response {
    Ok(HttpResponse::NotImplemented().finish())
}
