use crate::response::Response;
use actix_web::HttpResponse;
use web_user_identity::UserId;

pub(crate) async fn get_profile(user_id: UserId) -> Response {
    Ok(HttpResponse::NotImplemented().finish())
}

pub(crate) async fn update_profile(user_id: UserId) -> Response {
    Ok(HttpResponse::NotImplemented().finish())
}

pub(crate) async fn update_picture(user_id: UserId) -> Response {
    Ok(HttpResponse::NotImplemented().finish())
}

pub(crate) async fn change_password(user_id: UserId) -> Response {
    Ok(HttpResponse::NotImplemented().finish())
}
