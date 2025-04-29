use async_process::Command;
use bytes::Bytes;
use futures::channel::mpsc;
use futures::{AsyncReadExt, SinkExt};
use std::process::Stdio;
use std::time::Duration;
use tracing::error;

use crate::constants::{CHANNELS, SAMPLE_ENCODING, SAMPLE_FORMAT, SAMPLE_RATE};

#[derive(thiserror::Error, Debug)]
pub(crate) enum DecoderError {
    #[error("Failed to spawn ffmpeg process: {0}")]
    IO(#[from] std::io::Error),
    #[error("Failed to open stdout")]
    NoStdout,
}

/// Spawns an `ffmpeg` process to decode audio from a file starting at a given position,
/// returning a stream of raw PCM bytes through an `mpsc::Receiver`.
///
/// The decoder:
/// - Seeks to the requested `position` in the file.
/// - Outputs audio as signed 16-bit little-endian PCM (`s16le`) at 48 000 sample rate and 2 channels.
/// - Strips any metadata from the output.
/// - Writes the raw audio stream to stdout.
///
/// # Arguments
///
/// * `file` - Path to the audio file to decode.
/// * `position` - Seek position (from start of file) to begin decoding.
///
/// # Returns
///
/// A `Result` containing:
/// - `Ok(mpsc::Receiver<Bytes>)`: Stream of decoded audio bytes.
/// - `Err(DecoderError)`: If spawning the process or accessing stdout fails.
///
/// # Example
///
/// ```no_run
/// let receiver = spawn_ffmpeg_decoder("track.mp3", &Duration::from_secs(30)).unwrap();
/// ```
pub(crate) fn spawn_ffmpeg_decoder(
    file: &str,
    position: &Duration,
) -> Result<mpsc::Receiver<Bytes>, DecoderError> {
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
        .arg(SAMPLE_ENCODING)
        .arg("-ar")
        .arg(format!("{}", SAMPLE_RATE))
        .arg("-ac")
        .arg(format!("{}", CHANNELS))
        .arg("-f")
        .arg(SAMPLE_FORMAT)
        .arg("-fflags")
        .arg("+bitexact")
        .arg("pipe:1")
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()?;

    let mut stdout = process.stdout.take().ok_or(DecoderError::NoStdout)?;

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
