use crate::config::Config;
use crate::db::DbPool;
use crate::router;
use actix_web::web;

pub(crate) fn configure<'a>(
    config: &'a Config,
    db_pool: &'a DbPool,
) -> impl Fn(&mut web::ServiceConfig) + 'a {
    move |cfg: &mut web::ServiceConfig| {
        cfg.app_data(web::Data::new(config.clone()))
            .app_data(web::Data::new(db_pool.clone()))
            .configure(router::configure);
    }
}
