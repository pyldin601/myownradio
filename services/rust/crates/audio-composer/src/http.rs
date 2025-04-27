use crate::composer::{compose_track, ComposeTrackEvent};
use actix_web::{web, HttpResponse, Responder};
use bytes::Bytes;
use futures::channel::mpsc;
use futures::{SinkExt, StreamExt};
use scheduler_client::scheduler_client::SchedulerClient;
use std::io;
use std::time::SystemTime;

pub(crate) async fn get_stream(
    channel_id: web::Path<u64>,
    scheduler_client: web::Data<SchedulerClient>,
) -> impl Responder {
    eprintln!("{:?}", channel_id);

    let now = SystemTime::now();
    let (mut sink, src) = mpsc::channel(0);

    let mut events_src = match compose_track(&channel_id, &now, &scheduler_client).await {
        Ok(events) => events,
        Err(error) => return HttpResponse::InternalServerError().body(error.to_string()),
    };

    actix_rt::spawn(async move {
        while let Some(event) = events_src.next().await {
            match event {
                ComposeTrackEvent::Start { .. } => {}
                ComposeTrackEvent::Chunk { data, .. } => {
                    if sink.send(data).await.is_err() {
                        break;
                    }
                }
                ComposeTrackEvent::Eof { .. } => {}
            }
        }
    });

    HttpResponse::Ok().streaming(src.map(Ok::<Bytes, io::Error>))
}

pub(crate) async fn restart_stream() -> impl Responder {
    HttpResponse::NotImplemented().finish()
}
