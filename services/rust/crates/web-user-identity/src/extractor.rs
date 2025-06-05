use crate::user_id::UserId;
use actix_http::{BoxedPayloadStream, Payload};
use actix_web::error::ErrorBadRequest;
use actix_web::{FromRequest, HttpRequest};
use futures::future::{Ready, err, ok};

impl FromRequest for UserId {
    type Error = actix_web::Error;
    type Future = Ready<Result<Self, Self::Error>>;

    fn from_request(req: &HttpRequest, _payload: &mut Payload<BoxedPayloadStream>) -> Self::Future {
        ok(UserId::from(
            match req.headers().get("user-id").and_then(|header| {
                header
                    .to_str()
                    .ok()
                    .and_then(|header| header.parse::<i32>().ok())
            }) {
                Some(user_id) => UserId(user_id),
                None => return err(ErrorBadRequest(String::from("no user-id header"))),
            },
        ))
    }
}
