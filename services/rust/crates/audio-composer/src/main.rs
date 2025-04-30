use crate::config::Config;
use crate::http::get_audio_stream;
use actix_web::web;
use actix_web::{App, HttpServer};
use scheduler_client::scheduler_client::SchedulerClient;
use tracing_subscriber::EnvFilter;

mod composer;
mod config;
mod constants;
mod ffmpeg;
mod http;
mod running_time;

const SHUTDOWN_TIMEOUT: u64 = 30;

#[dotenvy::load]
#[actix_rt::main]
async fn main() -> Result<(), std::io::Error> {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .init();

    let config = Config::from_env();
    let scheduler_client = SchedulerClient::new(&config.scheduler_endpoint);

    let bind_address = config.bind_address.clone();

    let server = HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(config.clone()))
            .app_data(web::Data::new(scheduler_client.clone()))
            .route(
                "/channel/{channel_id}/get-audio",
                web::get().to(get_audio_stream),
            )
    })
    .shutdown_timeout(SHUTDOWN_TIMEOUT)
    .bind(bind_address)?
    .run();

    server.await
}
