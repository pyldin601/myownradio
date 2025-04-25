use async_process::Command;
use bytes::Bytes;
use futures::channel::mpsc;
use futures::{AsyncReadExt, SinkExt};
use std::process::Stdio;
use std::time::Duration;
use tracing::error;

use crate::constants::SAMPLE_RATE;

#[derive(thiserror::Error, Debug)]
pub(crate) enum FfmpegError {
    #[error("Failed to spawn ffmpeg process: {0}")]
    IO(#[from] std::io::Error),
    #[error("Failed to open stdout")]
    NoStdout,
}

pub(crate) fn ffmpeg(
    file: &str,
    position: &Duration,
) -> Result<mpsc::Receiver<Bytes>, FfmpegError> {
    let mut process = Command::new("ffmpeg")
        .arg("-ss")
        .arg(format!("{:.3}", position.as_secs_f64()))
        .arg("-i")
        .arg(file)
        .arg("-map")
        .arg("0:a")
        .arg("-map_metadata")
        .arg("-1")
        .arg("-c:a")
        .arg("pcm_s16le")
        .arg("-ar")
        .arg(format!("{}", SAMPLE_RATE))
        .arg("-ac")
        .arg("2")
        .arg("-f")
        .arg("s16le")
        .arg("-fflags")
        .arg("+bitexact")
        .arg("pipe:1")
        .stdout(Stdio::piped())
        .spawn()?;

    let mut stdout = process.stdout.take().ok_or_else(|| FfmpegError::NoStdout)?;

    let (output_sink, output_src) = mpsc::channel(0);

    actix_rt::spawn(async move {
        let mut buffer = [0u8; 4096];
        let mut output_sink = output_sink;

        loop {
            let bytes_read = match stdout.read(&mut buffer).await {
                Ok(bytes_read) => bytes_read,
                Err(error) => {
                    error!(?error, "Error reading from ffmpeg");
                    break;
                }
            };

            if bytes_read == 0 {
                break; // EOF reached
            }

            let chunk = &buffer[0..bytes_read];

            if output_sink
                .send(Bytes::copy_from_slice(chunk))
                .await
                .is_err()
            {
                break;
            }
        }
    });

    Ok(output_src)
}
