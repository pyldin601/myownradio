pub(crate) fn hash_password(password: &str) -> Result<String, bcrypt::BcryptError> {
    bcrypt::hash(password, bcrypt::DEFAULT_COST)
}

pub(crate) fn verify_password(password: &str, hash: &str) -> Result<bool, bcrypt::BcryptError> {
    bcrypt::verify(password, hash)
}

#[derive(serde::Deserialize, serde::Serialize, Debug, Clone)]
pub(crate) struct LegacyAuthTokenData {
    #[serde(rename = "TOKEN")]
    pub(crate) token: String,
}

#[derive(serde::Deserialize, serde::Serialize, Debug, Clone)]
pub(crate) struct LegacyAuthTokenClaims {
    pub(crate) id: String,
    pub(crate) data: LegacyAuthTokenData,
}

pub(crate) fn sign_legacy_claims(
    claims: &LegacyAuthTokenClaims,
    legacy_secret_key: &str,
) -> String {
    let key = jsonwebtoken::EncodingKey::from_secret(legacy_secret_key.as_ref());
    let header = jsonwebtoken::Header::new(jsonwebtoken::Algorithm::HS256);

    jsonwebtoken::encode(&header, &claims, &key).expect("Unable to sign legacy claims")
}
