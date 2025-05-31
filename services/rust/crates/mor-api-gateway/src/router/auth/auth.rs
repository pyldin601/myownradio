use crate::response::Response;
use actix_web::HttpResponse;

pub(crate) async fn login() -> Response {
    Ok(HttpResponse::NotImplemented().finish())
}

pub(crate) async fn reset_password() -> Response {
    Ok(HttpResponse::NotImplemented().finish())
}

pub(crate) async fn signup() -> Response {
    Ok(HttpResponse::NotImplemented().finish())
}
