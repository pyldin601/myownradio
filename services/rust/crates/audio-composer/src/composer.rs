use bytes::Bytes;
use futures::{channel::mpsc, SinkExt, StreamExt};
use scheduler_client::scheduler_client::{GetPlayingAtError, SchedulerClient};
use std::time::{Duration, SystemTime};
use tracing::{debug, error};

use crate::constants::BYTES_TO_PTS_MULTIPLIER;
use crate::ffmpeg::{spawn_ffmpeg_decoder, DecoderError};
use crate::running_time::RunningTime;

pub(crate) struct ComposerConfig {
    pub(crate) channel_id: u64,
    pub(crate) initial_time: SystemTime,
}

#[derive(Debug)]
pub(crate) enum ComposeStreamEvent {
    TrackStart {
        pts: Duration,
        title: String,
        url: String,
    },
    Chunk {
        pts: Duration,
        data: Bytes,
    },
    Error {
        pts: Duration,
        error: ComposeTrackError,
    },
}

pub(crate) fn compose_stream(
    scheduler_client: SchedulerClient,
    config: ComposerConfig,
) -> mpsc::Receiver<ComposeStreamEvent> {
    let (output_sink, output_src) = mpsc::channel(0);

    actix_rt::spawn({
        let initial_time = config.initial_time.clone();
        let channel_id = config.channel_id.clone();

        let mut output_sink = output_sink;

        async move {
            let run_loop = || async move {
                let mut running_time = RunningTime::new();

                loop {
                    let clock_time = initial_time + *running_time.time();

                    let result = compose_track(&channel_id, &clock_time, &scheduler_client).await;
                    let mut track_events = match result {
                        Ok(track_events) => track_events,
                        Err(error) => {
                            let pts = running_time.time().clone();
                            output_sink
                                .send(ComposeStreamEvent::Error { error, pts })
                                .await?;
                            break;
                        }
                    };

                    while let Some(event) = track_events.next().await {
                        let pts = running_time.time().clone();
                        match event {
                            ComposeTrackEvent::Start { title, url, .. } => {
                                output_sink
                                    .send(ComposeStreamEvent::TrackStart { title, url, pts })
                                    .await?;
                                running_time.reset_pts();
                            }
                            ComposeTrackEvent::Chunk {
                                data,
                                pts: chunk_pts,
                            } => {
                                output_sink
                                    .send(ComposeStreamEvent::Chunk { data, pts })
                                    .await?;
                                running_time.advance_by_next_pts(&chunk_pts);
                            }
                            ComposeTrackEvent::Eof { chunks, .. } if chunks == 0 => {
                                running_time.advance_by_duration(&Duration::from_millis(100));
                                break;
                            }
                            ComposeTrackEvent::Eof {
                                pts: last_chunk_pts,
                                ..
                            } => {
                                running_time.advance_by_next_pts(&last_chunk_pts);
                                break;
                            }
                        }
                    }
                }

                Ok::<(), mpsc::SendError>(())
            };

            if let Err(error) = run_loop().await {
                debug!(?error, "stream composing loop has stopped");
            }
        }
    });

    output_src
}

#[derive(Debug, thiserror::Error)]
pub(crate) enum ComposeTrackError {
    #[error("Failed to get now playing")]
    NowPlayingError(#[from] GetPlayingAtError),

    #[error("Failed to decode audio")]
    DecoderError(#[from] DecoderError),
}

#[derive(Debug)]
pub(crate) enum ComposeTrackEvent {
    Start { title: String, url: String },
    Chunk { pts: Duration, data: Bytes },
    Eof { pts: Duration, chunks: u64 },
}

pub(crate) async fn compose_track(
    channel_id: &u64,
    clock_time: &SystemTime,
    scheduler_client: &SchedulerClient,
) -> Result<mpsc::Receiver<ComposeTrackEvent>, ComposeTrackError> {
    let now_playing = scheduler_client
        .get_playing_at(channel_id, clock_time)
        .await?;

    let (output_sink, output_src) = mpsc::channel(0);

    let decoder_src = spawn_ffmpeg_decoder(
        &now_playing.current_track.url,
        &now_playing.current_track.offset,
    )?;

    actix_rt::spawn({
        let mut sink = output_sink;
        let mut audio_src = decoder_src;

        async move {
            let mut total_chunks = 0;
            let mut chunk_offset = 0;
            let mut current_pts = Duration::ZERO;

            let run_loop = || async move {
                sink.send(ComposeTrackEvent::Start {
                    title: now_playing.current_track.title.clone(),
                    url: now_playing.current_track.url.clone(),
                })
                .await?;

                while let Some(chunk) = audio_src.next().await {
                    let chunk_len = chunk.len();
                    sink.send(ComposeTrackEvent::Chunk {
                        pts: current_pts,
                        data: chunk,
                    })
                    .await?;

                    let pts_after_chunk =
                        (chunk_offset + chunk_len) as f64 * BYTES_TO_PTS_MULTIPLIER;
                    current_pts = Duration::from_secs_f64(pts_after_chunk);
                    total_chunks += 1;
                    chunk_offset += chunk_len;
                }

                sink.send(ComposeTrackEvent::Eof {
                    pts: current_pts,
                    chunks: total_chunks,
                })
                .await?;

                Ok::<(), mpsc::SendError>(())
            };

            if let Err(error) = run_loop().await {
                debug!(?error, "track composing loop has stopped");
            };
        }
    });

    Ok(output_src)
}
