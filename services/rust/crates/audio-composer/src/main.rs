use crate::config::Config;
use actix_web::web::Data;
use actix_web::{App, HttpServer};
use scheduler_client::scheduler_client::SchedulerClient;

mod config;

const SHUTDOWN_TIMEOUT: u64 = 30;

#[dotenvy::load]
#[actix_rt::main]
async fn main() -> Result<(), std::io::Error> {
    let config = Config::from_env();
    let scheduler_client = SchedulerClient::new(&config.scheduler_endpoint);

    let bind_address = config.bind_address.clone();

    let server = HttpServer::new(move || {
        App::new()
            .app_data(Data::new(config.clone()))
            .app_data(Data::new(scheduler_client.clone()))
    })
    .shutdown_timeout(SHUTDOWN_TIMEOUT)
    .bind(bind_address)?
    .run();

    server.await
}
