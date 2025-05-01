use serde::Deserialize;

#[derive(Clone, Debug, Deserialize)]
pub(crate) struct Config {
    pub bind_address: String,
    pub scheduler_endpoint: String,
}

impl Config {
    pub(crate) fn from_env() -> Self {
        match envy::from_env::<Self>() {
            Ok(config) => config,
            Err(error) => panic!("missing environment variable: {:#?}", error),
        }
    }
}
