mod config;
mod data_structures;
mod http_extractors;
mod http_server;
mod mysql_client;
mod pubsub_client;
mod services;
mod storage;
mod system;
mod utils;
mod web_egress_controller_client;

use crate::config::Config;
use crate::mysql_client::MySqlClient;
use crate::pubsub_client::PubsubClient;
use crate::services::auth::{AuthService, AuthTokenService};
use crate::services::StreamServiceFactory;
use crate::storage::fs::local::LocalFileSystem;
use crate::web_egress_controller_client::WebEgressControllerClient;
use dotenv::dotenv;
use http_server::run_server;
use std::io::Result;

pub const VERSION: &str = env!("CARGO_PKG_VERSION");

#[actix_rt::main]
async fn main() -> Result<()> {
    dotenv().ok();

    let config = Config::from_env();

    let bind_address = config.bind_address.clone();

    let subscriber = tracing_subscriber::FmtSubscriber::builder()
        // all spans/events with a level higher than TRACE (e.g, debug, info, warn, etc.)
        // will be written to stdout.
        .with_max_level(config.log_level)
        // completes the builder.
        .finish();

    tracing::subscriber::set_global_default(subscriber).expect("setting default subscriber failed");

    let mysql_client = MySqlClient::new(&config.mysql)
        .await
        .expect("Unable to initialize MySQL client");

    let pubsub_client = PubsubClient::new(&config.pubsub.endpoint);
    let web_egress_controller_client = WebEgressControllerClient::new(
        &config.web_egress_controller.endpoint,
        &config.web_egress_controller.stream_player_url_prefix,
    );

    let auth_token_service = AuthTokenService::create(
        &config.auth_jwt_secret_key,
        &config.legacy_auth_jwt_secret_key,
    );

    let file_system = LocalFileSystem::create(config.file_system_root_path.clone());

    let stream_service_factory =
        StreamServiceFactory::create(&mysql_client, &config.radio_streamer, &pubsub_client);

    let auth_service = AuthService::new(mysql_client.clone(), auth_token_service.clone());

    let http_server = run_server(
        &bind_address,
        mysql_client,
        config,
        file_system,
        stream_service_factory,
        pubsub_client,
        auth_token_service,
        web_egress_controller_client,
        auth_service,
    )?;

    tracing::info!("Application started");

    http_server.await
}
