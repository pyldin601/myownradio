use actix_web::http::StatusCode;
use actix_web::{HttpResponse, ResponseError};
use serde::Serialize;

pub(crate) type Response = Result<HttpResponse, Error>;

#[derive(Serialize)]
struct ErrorResponse {
    error: &'static str,
}

#[derive(thiserror::Error, Debug)]
pub(crate) enum Error {
    #[error("Error running SQL query: {0}")]
    DatabaseError(#[from] sqlx::Error),
    #[error("IO error: {0}")]
    IOError(#[from] std::io::Error),
    #[error("Entity not found")]
    EntityNotFound,
}

impl ResponseError for Error {
    fn status_code(&self) -> StatusCode {
        match self {
            Error::EntityNotFound => StatusCode::NOT_FOUND,
            // default to internal server error
            _ => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    fn error_response(&self) -> HttpResponse {
        let error = match self {
            Error::EntityNotFound => "NotFound",
            // default to internal server error
            _ => "InternalServerError",
        };

        HttpResponse::build(self.status_code()).json(ErrorResponse { error })
    }
}
