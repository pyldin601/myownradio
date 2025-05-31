use crate::response::Response;
use actix_web::HttpResponse;

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
pub(crate) async fn login() -> Response {
    Ok(HttpResponse::NotImplemented().finish())
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
pub(crate) async fn reset_password() -> Response {
    Ok(HttpResponse::NotImplemented().finish())
}

/// Sends an email with signup instructions. If the email is associated with an account, it should send an email with login or password reset instructions.
///
/// Expected input:
/// - `email`: String
///
/// Returns:
/// - `200 OK` email has been sent
/// - `501 Not Implemented` (placeholder for now)
pub(crate) async fn signup() -> Response {
    // TODO: if the email is associated with an account, send login instructions
    // TODO: otherwise, send an email explaining that signup is currently disabled
    Ok(HttpResponse::NotImplemented().finish())
}
