use bytes::Bytes;
use futures::{channel::mpsc, SinkExt, StreamExt};
use scheduler_client::scheduler_client::{GetNowPlayingError, SchedulerClient};
use std::time::{Duration, SystemTime};
use tracing::error;

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
    Eof {
        pts: Duration,
    },
    Error {
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
                        Ok(mut track_events) => track_events,
                        Err(error) => {
                            output_sink
                                .send(ComposeStreamEvent::Error { error })
                                .await?;
                            continue;
                        }
                    };

                    while let Some(event) = track_events.next().await {
                        let pts = running_time.time().clone();
                        match event {
                            ComposeTrackEvent::Start { title, url, .. } => {
                                output_sink
                                    .send(ComposeStreamEvent::TrackStart { title, url, pts })
                                    .await?;
                            }
                            ComposeTrackEvent::Chunk { data, .. } => {
                                output_sink
                                    .send(ComposeStreamEvent::Chunk { data, pts })
                                    .await?;
                            }
                            ComposeTrackEvent::Eof { chunks, .. } if chunks == 0 => {
                                running_time.advance_by_duration(&Duration::from_millis(100));
                            }
                            ComposeTrackEvent::Eof { .. } => {
                                let pts = running_time.time().clone();
                                output_sink.send(ComposeStreamEvent::Eof { pts }).await?;
                            }
                        }
                    }
                }

                Ok::<(), mpsc::SendError>(())
            };

            if let Err(error) = run_loop().await {
                error!(?error, "Failed to run stream composing loop");
            }
        }
    });

    output_src
}

#[derive(Debug, thiserror::Error)]
pub(crate) enum ComposeTrackError {
    #[error("Failed to get now playing")]
    NowPlayingError(#[from] GetNowPlayingError),

    #[error("Failed to decode audio")]
    DecoderError(#[from] DecoderError),

    #[error("Playback was stopped")]
    Stopped,

    #[error("Unable to read source audio")]
    UnreadableSource,
}

#[derive(Debug)]
pub(crate) enum ComposeTrackEvent {
    Start {
        pts: Duration,
        title: String,
        url: String,
    },
    Chunk {
        pts: Duration,
        data: Bytes,
    },
    Eof {
        pts: Duration,
        chunks: u64,
    },
}

pub(crate) async fn compose_track(
    channel_id: &u64,
    clock_time: &SystemTime,
    scheduler_client: &SchedulerClient,
) -> Result<mpsc::Receiver<ComposeTrackEvent>, ComposeTrackError> {
    let now_playing = scheduler_client
        .get_now_playing(channel_id, clock_time)
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
            let mut current_pts = Duration::ZERO;

            let run_loop = || async move {
                sink.send(ComposeTrackEvent::Start {
                    pts: Duration::ZERO,
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

                    let pts_after_chunk = chunk_len as f64 * BYTES_TO_PTS_MULTIPLIER;
                    current_pts = Duration::from_secs_f64(pts_after_chunk);
                    total_chunks += 1;
                }

                sink.send(ComposeTrackEvent::Eof {
                    pts: current_pts,
                    chunks: total_chunks,
                })
                .await?;

                Ok::<(), mpsc::SendError>(())
            };

            if let Err(error) = run_loop().await {
                error!(?error, "Failed to run loop");
            };
        }
    });

    Ok(output_src)
}
