use actix_web::{web, HttpResponse, Responder};
use bytes::Bytes;
use futures::channel::mpsc;
use futures::{SinkExt, StreamExt};
use scheduler_client::scheduler_client::SchedulerClient;
use std::io::Error;
use std::time::UNIX_EPOCH;

use crate::composer::{compose_track, ComposeTrackEvent};

pub(crate) async fn get_audio_stream(
    path_params: web::Path<(u64, u64)>,
    scheduler_client: web::Data<SchedulerClient>,
) -> impl Responder {
    let (channel_id, unix_time) = path_params.into_inner();
    let clock_time = UNIX_EPOCH + std::time::Duration::from_millis(unix_time);

    let (mut output_sink, output_src) = mpsc::channel(0);

    let mut events_src = match compose_track(&channel_id, &clock_time, &scheduler_client).await {
        Ok(events) => events,
        Err(error) => return HttpResponse::InternalServerError().body(error.to_string()),
    };

    actix_rt::spawn(async move {
        while let Some(event) = events_src.next().await {
            match event {
                ComposeTrackEvent::Start { .. } => {}
                ComposeTrackEvent::Chunk { data, .. } => {
                    if output_sink.send(data).await.is_err() {
                        break;
                    }
                }
                ComposeTrackEvent::Eof { .. } => {}
            }
        }
    });

    HttpResponse::Ok().streaming(output_src.map(Ok::<Bytes, Error>))
}

pub(crate) async fn sync_audio_stream() -> impl Responder {
    HttpResponse::NotImplemented().finish()
}
