use crate::composer::{compose_stream, ComposeStreamEvent, ComposerConfig};
use actix_rt::time::Instant;
use actix_web::{web, HttpResponse, Responder};
use bytes::Bytes;
use futures::channel::mpsc;
use futures::{SinkExt, StreamExt};
use scheduler_client::scheduler_client::SchedulerClient;
use serde::Deserialize;
use std::io::Error;
use std::time::UNIX_EPOCH;
use tracing::debug;

#[derive(Deserialize)]
pub(crate) struct GetAudioStreamQueryParams {
    ts: u64,
}

pub(crate) async fn get_audio_stream(
    path: web::Path<u64>,
    query: web::Query<GetAudioStreamQueryParams>,
    scheduler_client: web::Data<SchedulerClient>,
) -> impl Responder {
    let channel_id = path.into_inner();
    let initial_time = UNIX_EPOCH + std::time::Duration::from_millis(query.ts);

    debug!(
        "Client connected. Channel: {}, Time: {:?}",
        channel_id, initial_time
    );

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
                    debug!("Now playing. Channel: {}, Title: {}", channel_id, title);
                }
                ComposeStreamEvent::Chunk { data, pts } => {
                    if output_sink.send(data).await.is_err() {
                        break;
                    }

                    actix_rt::time::sleep_until(start_time + pts).await;
                }
                ComposeStreamEvent::Eof { .. } => {
                    debug!("End of stream. Channel: {}", channel_id);
                }
                ComposeStreamEvent::Error { error } => {
                    debug!("Error. Channel: {}, Error: {}", channel_id, error);
                }
            }
        }
    });

    HttpResponse::Ok().streaming(output_src.map(Ok::<Bytes, Error>))
}
