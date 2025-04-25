use bytes::Bytes;
use futures::channel::mpsc;
use futures::{SinkExt, StreamExt};
use scheduler_client::scheduler_client::SchedulerClient;
use std::time::SystemTime;
use tracing::error;

use crate::ffmpeg::ffmpeg;
use crate::running_time::RunningTime;

pub(crate) struct ComposerConfig {
    pub(crate) channel_id: usize,
    pub(crate) sample_rate: usize,
    pub(crate) initial_time: SystemTime,
}

pub(crate) fn compose(
    scheduler_client: SchedulerClient,
    config: ComposerConfig,
) -> mpsc::Receiver<Bytes> {
    let (sink, src) = mpsc::channel(0);

    let running_time = RunningTime::new();

    actix_rt::spawn({
        let initial_time = config.initial_time.clone();
        let channel_id = config.channel_id.clone();

        async move {
            let clock_time = initial_time + *running_time.time();

            let now_playing = match scheduler_client
                .get_now_playing(&channel_id, &clock_time)
                .await
            {
                Ok(now_playing) => now_playing,
                Err(error) => {
                    error!(?error, "Failed to get now playing");
                    return;
                }
            };

            let mut ffmpeg_src = match ffmpeg(
                &now_playing.current_track.url,
                &now_playing.current_track.offset,
            ) {
                Ok(src) => src,
                Err(_) => todo!(),
            };

            let mut sink = sink;

            while let Some(bytes) = ffmpeg_src.next().await {
                if let Err(error) = sink.send(bytes).await {
                    error!(?error, "Failed to send audio");
                    return;
                }
            }
        }
    });

    src
}
