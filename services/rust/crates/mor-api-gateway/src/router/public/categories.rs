use crate::response::Response;
use actix_web::HttpResponse;

pub(crate) async fn list_categories() -> Response {
    Ok(HttpResponse::NotImplemented().finish())
}
