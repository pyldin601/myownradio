use crate::entities::stream::StreamRow;
use crate::mysql_client::MySqlClient;
use crate::response;
use actix_web::{web, HttpResponse, Responder};
use sqlx::{MySql, QueryBuilder};
use std::ops::DerefMut;

fn create_builder<'a>() -> QueryBuilder<'a, MySql> {
    QueryBuilder::new(StreamRow::select_from())
}

pub(crate) async fn list_user_channels(
    user_id: web::Path<i64>,
    mysql_client: web::Data<MySqlClient>,
) -> response::Response {
    let user_id = user_id.into_inner();
    let mut connection = mysql_client.connection().await?;

    let mut builder = create_builder();

    builder.push("WHERE `r_streams`.`uid` = ");
    builder.push_bind(user_id);

    let query = builder.build_query_as::<StreamRow>();
    let channels = query.fetch_all(connection.deref_mut()).await?;

    Ok(HttpResponse::Ok().json(channels))
}

pub(crate) async fn get_user_channel(
    path: web::Path<(i64, i64)>,
    mysql_client: web::Data<MySqlClient>,
) -> response::Response {
    let (user_id, channel_id) = path.into_inner();
    let mut connection = mysql_client.connection().await?;

    let mut builder = create_builder();

    builder.push("WHERE `r_streams`.`uid` = ");
    builder.push_bind(user_id);
    builder.push(" AND `r_streams`.`sid` = ");
    builder.push_bind(channel_id);

    let query = builder.build_query_as::<StreamRow>();
    let channel = query
        .fetch_optional(connection.deref_mut())
        .await?
        .ok_or(response::Error::EntityNotFound)?;

    Ok(HttpResponse::Ok().json(channel))
}

pub(crate) async fn update_user_channel() -> impl Responder {
    HttpResponse::NotImplemented().finish()
}

pub(crate) async fn create_user_channel() -> impl Responder {
    HttpResponse::NotImplemented().finish()
}
