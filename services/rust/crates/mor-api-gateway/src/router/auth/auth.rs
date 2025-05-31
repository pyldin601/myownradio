use crate::response::Response;
use actix_web::{web, HttpResponse};

#[derive(serde::Deserialize)]
pub(crate) struct LoginRequestBody {
    email: String,
    password: String,
}

/// Logs a user in using email and password credentials.
///
/// Expected input:
/// - `email`: String
/// - `password`: String
///
/// Returns:
/// - `200 OK` on success
/// - `401 Unauthorized` if credentials are invalid
/// - `501 Not Implemented` (placeholder for now)
pub(crate) async fn login(body: web::Json<LoginRequestBody>) -> Response {
    let LoginRequestBody { email, password } = body.into_inner();

    Ok(HttpResponse::NotImplemented().finish())
}

#[derive(serde::Deserialize)]
pub(crate) struct ResetPasswordRequestBody {
    email: String,
}

/// Initiates a password reset flow for the given email address.
///
/// Expected input:
/// - `email`: String
///
/// Returns:
/// - `200 OK` regardless of email existence. If the email is associated with an account, an email with instructions is sent
/// - `400 Bad Request` if the email is invalid
/// - `501 Not Implemented` (placeholder for now)
pub(crate) async fn reset_password(body: web::Json<ResetPasswordRequestBody>) -> Response {
    let ResetPasswordRequestBody { email } = body.into_inner();

    Ok(HttpResponse::NotImplemented().finish())
}

#[derive(serde::Deserialize)]
pub(crate) struct SignupRequestBody {
    email: String,
}

/// Sends an email with signup instructions. If the email is associated with an account, it should send an email with login or password reset instructions.
///
/// Expected input:
/// - `email`: String
///
/// Returns:
/// - `200 OK` email has been sent
/// - `501 Not Implemented` (placeholder for now)
pub(crate) async fn signup(body: web::Json<SignupRequestBody>) -> Response {
    let SignupRequestBody { email } = body.into_inner();

    // TODO: if the email is associated with an account, send login instructions
    // TODO: otherwise, send an email explaining that signup is currently disabled
    Ok(HttpResponse::NotImplemented().finish())
}
