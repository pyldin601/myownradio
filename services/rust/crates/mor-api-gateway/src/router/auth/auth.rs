use crate::auth;
use crate::auth::legacy;
use crate::config::Config;
use crate::db::{sessions, users, DbPool};
use crate::response::Response;
use actix_web::cookie::time::OffsetDateTime;
use actix_web::cookie::CookieBuilder;
use actix_web::{web, HttpResponse};
use chrono::Utc;
use tracing::error;

const LEGACY_SESSION_COOKIE_NAME: &str = "secure_session";
const YEAR: std::time::Duration = std::time::Duration::from_secs(31_536_000);

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
pub(crate) async fn login(
    body: web::Json<LoginRequestBody>,
    pool: web::Data<DbPool>,
    config: web::Data<Config>,
) -> Response {
    let LoginRequestBody { email, password } = body.into_inner();

    let mut conn = pool.get_connection().await?;

    let user = match users::get_by_email(&email, &mut conn).await? {
        Some(user) => user,
        None => return Ok(HttpResponse::Unauthorized().finish()),
    };

    let password_hash = match user.password.clone() {
        Some(password_hash) => password_hash,
        None => return Ok(HttpResponse::Unauthorized().finish()),
    };

    let password_valid = match auth::legacy::verify_password(&password, &password_hash) {
        Ok(valid) => valid,
        Err(error) => {
            error!(?error, "Password verification failed");
            return Ok(HttpResponse::InternalServerError().finish());
        }
    };

    if !password_valid {
        return Ok(HttpResponse::Unauthorized().finish());
    }

    // Create a legacy session
    let token = uuid::Uuid::new_v4().to_string().replace("-", "");
    let session_id = uuid::Uuid::new_v4().to_string();
    let session = sessions::Session {
        token,
        session_id,
        uid: user.uid,
        ip: String::default(),
        client_id: String::default(),
        authorized: Utc::now().naive_utc(),
        permanent: 1,
        expires: None,
        http_user_agent: String::default(),
    };
    sessions::create(&session, &mut conn).await?;

    let claims = legacy::TokenClaims {
        id: session.session_id,
        data: legacy::TokenData {
            token: session.token,
        },
    };
    let signature = legacy::sign_legacy_claims(&claims, &config.auth_legacy_session_secret_key);

    let session_cookie = CookieBuilder::new(LEGACY_SESSION_COOKIE_NAME, signature)
        .expires(OffsetDateTime::now_utc() + YEAR)
        .finish();

    Ok(HttpResponse::Ok().cookie(session_cookie).json(user))
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
