use crate::auth::legacy;
use crate::config::Config;
use crate::db::{sessions, users, DbPool};
use crate::response::Response;
use actix_web::cookie::time::OffsetDateTime;
use actix_web::cookie::CookieBuilder;
use actix_web::dev::ConnectionInfo;
use actix_web::{web, HttpRequest, HttpResponse};
use chrono::{TimeDelta, Utc};
use std::ops::Add;
use tracing::error;

const LEGACY_SESSION_COOKIE_NAME: &str = "secure_session";
const DURATION_YEAR: std::time::Duration = std::time::Duration::from_secs(31_536_000);
const TIME_DELTA_YEAR: TimeDelta = TimeDelta::days(365);

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
    req: HttpRequest,
    conn_info: ConnectionInfo,
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

    let password_valid = match legacy::verify_password(&password, &password_hash) {
        Ok(valid) => valid,
        Err(error) => {
            error!(?error, "Password verification failed");
            return Ok(HttpResponse::InternalServerError().finish());
        }
    };

    if !password_valid {
        return Ok(HttpResponse::Unauthorized().finish());
    }

    let token = uuid::Uuid::new_v4().to_string().replace("-", "");
    let session_id = legacy::uniqid("", false);
    let ip = conn_info
        .realip_remote_addr()
        .unwrap_or_default()
        .to_string();
    let http_user_agent = req
        .headers()
        .get("User-Agent")
        .and_then(|val| val.to_str().ok())
        .unwrap_or("")
        .to_string();

    let session = sessions::Session {
        token,
        session_id,
        uid: user.uid,
        ip,
        permanent: 1,
        authorized: Utc::now().naive_utc(),
        expires: Some(Utc::now().add(TIME_DELTA_YEAR).naive_utc()),
        client_id: legacy::generate_unique_id(),
        http_user_agent,
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
        .path("/")
        .http_only(true)
        .expires(OffsetDateTime::now_utc() + DURATION_YEAR)
        .finish();

    Ok(HttpResponse::Ok().cookie(session_cookie).finish())
}

pub(crate) async fn logout(
    req: HttpRequest,
    config: web::Data<Config>,
    pool: web::Data<DbPool>,
) -> Response {
    let session_cookie_value = match req.cookie(LEGACY_SESSION_COOKIE_NAME) {
        Some(cookie) => cookie.value().to_string(),
        None => {
            return Ok(HttpResponse::Unauthorized().finish());
        }
    };

    let legacy_claims = match legacy::verify_legacy_claims(
        &session_cookie_value,
        &config.auth_legacy_session_secret_key,
    ) {
        Some(claims) => claims,
        None => {
            return Ok(HttpResponse::Unauthorized().finish());
        }
    };

    let mut conn = pool.get_connection().await?;

    let _ = sessions::delete(&legacy_claims.data.token, &mut conn).await?;

    let expired_cookie = CookieBuilder::new(LEGACY_SESSION_COOKIE_NAME, "")
        .path("/")
        .http_only(true)
        .expires(OffsetDateTime::now_utc())
        .finish();

    Ok(HttpResponse::Ok().cookie(expired_cookie).finish())
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
