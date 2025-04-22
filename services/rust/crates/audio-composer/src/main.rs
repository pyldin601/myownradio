use crate::config::Config;
use scheduler_client::scheduler_client::SchedulerClient;

mod config;

#[actix_rt::main]
async fn main() -> Result<(), std::io::Error> {
    let config = Config::from_env();
    let scheduler_client = SchedulerClient::new(&config.scheduler_endpoint);

    println!("Hello, world!");

    Ok(())
}
