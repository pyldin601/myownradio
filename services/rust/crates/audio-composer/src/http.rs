use crate::composer::{compose_stream, ComposeStreamEvent, ComposerConfig};
use actix_rt::time::Instant;
use actix_web::{web, HttpResponse, Responder};
use futures::channel::mpsc;
use futures::{SinkExt, StreamExt};
use scheduler_client::scheduler_client::SchedulerClient;
use serde::Deserialize;
use std::io::Error;
use std::time::{Duration, UNIX_EPOCH};
use tracing::debug;

#[derive(Deserialize)]
pub(crate) struct GetAudioStreamQueryParams {
    ts: u64,
    #[serde(default)]
    pre: u64,
}

pub(crate) async fn get_audio_stream(
    path: web::Path<u64>,
    query: web::Query<GetAudioStreamQueryParams>,
    scheduler_client: web::Data<SchedulerClient>,
) -> impl Responder {
    let channel_id = path.into_inner();
    let initial_time = UNIX_EPOCH + Duration::from_millis(query.ts);
    let preload_time = Duration::from_millis(query.pre);

    debug!("Client connected. Channel: {channel_id}, Time: {initial_time:?}");

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
                ComposeStreamEvent::TrackStart { title, pts, .. } => {
                    debug!("Now playing. Channel: {channel_id}, Title: {title}, Pts: {pts:?}");
                }
                ComposeStreamEvent::Chunk { data, pts } => {
                    if output_sink.send(Ok::<_, Error>(data)).await.is_err() {
                        break;
                    }

                    actix_rt::time::sleep_until(start_time + pts - preload_time).await;
                }
                ComposeStreamEvent::Eof { pts } => {
                    debug!("End of stream. Channel: {channel_id}, Pts: {pts:?}");
                }
                ComposeStreamEvent::Error { error, pts } => {
                    debug!("Error. Channel: {channel_id}, Error: {error}, Pts: {pts:?}");
                }
            }
        }
    });

    HttpResponse::Ok().streaming(output_src)
}
