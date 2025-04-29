use crate::composer::{compose_stream, ComposeStreamEvent, ComposerConfig};
use actix_rt::time::Instant;
use actix_web::{web, HttpResponse, Responder};
use bytes::Bytes;
use futures::channel::mpsc;
use futures::{SinkExt, StreamExt};
use scheduler_client::scheduler_client::SchedulerClient;
use std::io::Error;
use std::time::UNIX_EPOCH;

pub(crate) async fn get_audio_stream(
    path_params: web::Path<(u64, u64)>,
    scheduler_client: web::Data<SchedulerClient>,
) -> impl Responder {
    let (channel_id, unix_time) = path_params.into_inner();
    let initial_time = UNIX_EPOCH + std::time::Duration::from_millis(unix_time);

    let (mut output_sink, output_src) = mpsc::channel(0);

    let mut events_src = compose_stream(
        Clone::clone(&scheduler_client),
        ComposerConfig {
            channel_id,
            initial_time,
        },
    );

    actix_rt::spawn(async move {
        let start_time = Instant::now();

        while let Some(event) = events_src.next().await {
            match event {
                ComposeStreamEvent::TrackStart { title, .. } => {
                    println!("Starting track: {}", title);
                }
                ComposeStreamEvent::Chunk { data, pts } => {
                    if output_sink.send(data).await.is_err() {
                        break;
                    }

                    actix_rt::time::sleep_until(start_time + pts).await;
                }
                ComposeStreamEvent::Eof { .. } => {}
                ComposeStreamEvent::Error { .. } => {}
            }
        }
    });

    HttpResponse::Ok().streaming(output_src.map(Ok::<Bytes, Error>))
}

pub(crate) async fn sync_audio_stream() -> impl Responder {
    HttpResponse::NotImplemented().finish()
}
