use crate::response::Response;
use actix_web::HttpResponse;

pub(crate) async fn now_playing() -> Response {
    Ok(HttpResponse::NotImplemented().finish())
}

pub(crate) async fn bulk_now_playing() -> Response {
    Ok(HttpResponse::NotImplemented().finish())
}

pub(crate) async fn get_timeline() -> Response {
    Ok(HttpResponse::NotImplemented().finish())
}
