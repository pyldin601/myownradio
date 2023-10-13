use crate::config::Config;
use crate::stream::{Stream, StreamConfig, StreamOutput};
use std::time::Duration;

pub(crate) mod config;
pub(crate) mod gstreamer_utils;
pub(crate) mod stream;
pub(crate) mod stream_utils;

pub(crate) fn main() {
    tracing_subscriber::fmt::init();

    let config = Config::from_env();

    gstreamer::init().expect("Unable to initialize GStreamer!");

    // TODO Implement proper handling of the stream lifecycle
    let stream = Stream::create(
        config.webpage_url,
        &StreamConfig {
            output: StreamOutput::RTMP {
                url: config.rtmp_url,
                stream_key: config.rtmp_stream_key,
            },
            video_width: config.video.width,
            video_height: config.video.height,
            video_bitrate: config.video.bitrate,
            video_framerate: config.video.framerate,
            audio_bitrate: config.audio.bitrate,
        },
    )
    .expect("Unable to create stream");

    loop {
        // TODO Stream events and handle process signals
        std::thread::sleep(Duration::from_secs(1));
    }

    drop(stream);
}