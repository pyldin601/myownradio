use crate::response::Response;
use actix_web::HttpResponse;

pub(crate) async fn list_channels() -> Response {
    Ok(HttpResponse::NotImplemented().finish())
}

pub(crate) async fn similar_channels() -> Response {
    Ok(HttpResponse::NotImplemented().finish())
}

pub(crate) async fn search_channels() -> Response {
    Ok(HttpResponse::NotImplemented().finish())
}

pub(crate) async fn get_channel_info() -> Response {
    Ok(HttpResponse::NotImplemented().finish())
}
