use crate::config::Config;
use crate::db::DbPool;
use crate::routes::{channel_tracks, channels};
use actix_web::{web, App, HttpServer};
use tracing::info;
use tracing_subscriber::EnvFilter;

mod config;
mod db;
mod response;
mod routes;

const SHUTDOWN_TIMEOUT: u64 = 30;

#[dotenvy::load]
#[actix_rt::main]
async fn main() -> std::io::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .init();

    let config = Config::from_env();
    let db_pool = DbPool::create(
        &config.mysql.user,
        &config.mysql.password,
        &config.mysql.host,
        &config.mysql.database,
    );

    let bind_address = config.bind_address.clone();

    let server = HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(config.clone()))
            .app_data(web::Data::new(db_pool.clone()))
            .service(
                web::scope("/users/{userId}").service(
                    web::scope("/channels")
                        .service(
                            web::resource("")
                                .get(channels::list_channels)
                                .post(channels::create_channel),
                        )
                        .service(
                            web::resource("/{channelId}")
                                .get(channels::get_channel)
                                .put(channels::update_channel)
                                .delete(channels::delete_channel),
                        )
                        .service(
                            web::scope("/{channelId}/tracks")
                                .service(
                                    web::resource("")
                                        .get(channel_tracks::list_tracks)
                                        .post(channel_tracks::add_track),
                                )
                                .service(
                                    web::resource("/{trackId}")
                                        .delete(channel_tracks::delete_track),
                                )
                                .service(
                                    web::resource("/{trackId}/reorder")
                                        .route(web::post().to(channel_tracks::reorder_track)),
                                ),
                        ),
                ),
            )
    })
    .shutdown_timeout(SHUTDOWN_TIMEOUT)
    .bind(bind_address.clone())?
    .run();

    info!("server is listening on: {bind_address}");

    server.await
}
