use std::collections::HashSet;

pub(crate) fn hash_password(password: &str) -> Result<String, bcrypt::BcryptError> {
    bcrypt::hash(password, bcrypt::DEFAULT_COST)
}

pub(crate) fn verify_password(password: &str, hash: &str) -> Result<bool, bcrypt::BcryptError> {
    bcrypt::verify(password, hash)
}

#[derive(serde::Deserialize, serde::Serialize, Debug, Clone)]
pub(crate) struct TokenData {
    #[serde(rename = "TOKEN")]
    pub(crate) token: String,
}

#[derive(serde::Deserialize, serde::Serialize, Debug, Clone)]
pub(crate) struct TokenClaims {
    pub(crate) id: String,
    pub(crate) data: TokenData,
}

pub(crate) fn sign_legacy_claims(claims: &TokenClaims, legacy_secret_key: &str) -> String {
    let key = jsonwebtoken::EncodingKey::from_secret(legacy_secret_key.as_ref());
    let header = jsonwebtoken::Header::new(jsonwebtoken::Algorithm::HS256);

    jsonwebtoken::encode(&header, &claims, &key).expect("Unable to sign legacy claims")
}

pub(crate) fn verify_legacy_claims(token: &str, legacy_secret_key: &str) -> Option<TokenClaims> {
    let key = jsonwebtoken::DecodingKey::from_secret(legacy_secret_key.as_ref());
    let mut validation = jsonwebtoken::Validation::default();

    validation.validate_exp = false;
    validation.required_spec_claims = HashSet::new();

    match jsonwebtoken::decode::<TokenClaims>(token, &key, &validation) {
        Ok(data) => Some(data.claims.clone()),
        Err(_) => None,
    }
}

pub(crate) fn generate_unique_id() -> String {
    use rand::Rng;

    static ID_CHARACTERS: &[u8] = b"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    static UNIQUE_ID_LENGTH: usize = 8;

    let mut rng = rand::rng();

    (0..UNIQUE_ID_LENGTH)
        .map(|_| {
            let idx = rng.random_range(0..ID_CHARACTERS.len());
            char::from(ID_CHARACTERS[idx])
        })
        .collect()
}

pub(crate) fn uniqid(prefix: &str, more_entropy: bool) -> String {
    use std::time::{SystemTime, UNIX_EPOCH};

    let micros = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("Time went backwards")
        .as_micros();

    let mut id = format!("{}{:x}", prefix, micros);

    if more_entropy {
        let entropy: f64 = rand::random();
        id.push_str(&format!("{:x}", (entropy * 0xfffff as f64) as u64));
    }

    id
}
