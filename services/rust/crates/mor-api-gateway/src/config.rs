use serde::Deserialize;

#[derive(Clone, Debug, Deserialize)]
pub(crate) struct MySqlConfig {
    #[serde(rename = "mysql_host")]
    pub(crate) host: String,
    #[serde(rename = "mysql_user")]
    pub(crate) user: String,
    #[serde(rename = "mysql_password")]
    pub(crate) password: String,
    #[serde(rename = "mysql_database")]
    pub(crate) database: String,
}

#[derive(Clone, Debug, Deserialize)]
pub(crate) struct Config {
    pub(crate) bind_address: String,
    #[serde(flatten)]
    pub(crate) mysql: MySqlConfig,
}

impl Config {
    pub(crate) fn from_env() -> Self {
        match envy::from_env::<Self>() {
            Ok(config) => config,
            Err(error) => panic!("Missing environment variable: {:#?}", error),
        }
    }
}
