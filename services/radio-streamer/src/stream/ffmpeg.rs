use crate::audio_formats::AudioFormat;
use crate::helpers::io::{read_from_stdout, write_to_stdin};
use crate::helpers::system::which;
use crate::metrics::Metrics;
use crate::stream::constants::{
    AUDIO_BITRATE, AUDIO_BYTES_PER_SECOND, AUDIO_CHANNELS_NUMBER, AUDIO_SAMPLING_FREQUENCY,
};
use crate::stream::types::{Buffer, Format};
use actix_web::web::Bytes;
use async_process::{Command, Stdio};
use futures::channel::{mpsc, oneshot};
use futures::io::BufReader;
use futures::{SinkExt, StreamExt};
use futures_lite::{AsyncBufReadExt, FutureExt};
use lazy_static::lazy_static;
use scopeguard::defer;
use slog::{debug, error, info, o, warn, Logger};
use std::sync::Arc;
use std::time::{Duration, Instant};

const STDIO_BUFFER_SIZE: usize = 4096;

lazy_static! {
    static ref FFMPEG_COMMAND: &'static str =
        Box::leak(Box::new(which("ffmpeg").expect("Unable to locate ffmpeg")));
    static ref FFPROBE_COMMAND: &'static str = Box::leak(Box::new(
        which("ffprobe").expect("Unable to locate ffprobe")
    ));
}

#[derive(Debug)]
pub(crate) enum DecoderError {
    ProcessError,
    StdoutUnavailable,
    StderrUnavailable,
}

pub(crate) enum DecoderOutput {
    Buffer(Buffer),
    EOF,
}

pub(crate) fn build_ffmpeg_decoder(
    source_url: &str,
    offset: &Duration,
    logger: &Logger,
    metrics: &Metrics,
) -> Result<mpsc::Receiver<DecoderOutput>, DecoderError> {
    let (mut tx, rx) = mpsc::channel::<DecoderOutput>(0);
    let logger = logger.new(o!("kind" => "ffmpeg_decoder"));

    let mut start_time = Some(Instant::now());

    let mut process = match Command::new(*FFMPEG_COMMAND)
        .args(&[
            "-v",
            "quiet",
            "-hide_banner",
            "-ss",
            &format!("{:.4}", offset.as_secs_f32()),
            "-i",
            &source_url,
            "-vn",
            "-codec:a",
            "pcm_s16le",
            "-ar",
            &AUDIO_SAMPLING_FREQUENCY.to_string(),
            "-ac",
            &AUDIO_CHANNELS_NUMBER.to_string(),
            "-f",
            "s16le", // BYTES_PER_SAMPLE = 2
            "-",
        ])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .stdin(Stdio::null())
        .spawn()
    {
        Ok(process) => process,
        Err(error) => {
            error!(logger, "Unable to start the decoder process"; "error" => ?error);
            return Err(DecoderError::ProcessError);
        }
    };
    let format = Arc::new(Format {
        codec: "pcm_s16le".to_string(),
        container: "s16le".to_string(),
        bitrate: AUDIO_BITRATE,
        channels: AUDIO_CHANNELS_NUMBER,
        sample_rate: AUDIO_SAMPLING_FREQUENCY,
    });

    info!(logger, "Started audio decoder"; "url" => source_url, "offset" => ?offset);

    let status = process.status();

    let stdout = match process.stdout.take() {
        Some(stdout) => stdout,
        None => {
            error!(logger, "Unable to start decoder: stdout is not available");
            return Err(DecoderError::StdoutUnavailable);
        }
    };

    let stderr = match process.stderr.take() {
        Some(stderr) => stderr,
        None => {
            error!(logger, "Unable to start decoder: stderr is not available");
            return Err(DecoderError::StderrUnavailable);
        }
    };

    actix_rt::spawn({
        let logger = logger.clone();

        async move {
            let mut err_lines = BufReader::new(stderr).split(b'\r');

            while let Some(Ok(line)) = err_lines.next().await {
                for s in String::from_utf8_lossy(&line).split('\n') {
                    debug!(logger, "ffmpeg output: {}", s)
                }
            }

            drop(err_lines);
        }
    });

    actix_rt::spawn({
        let metrics = metrics.clone();
        let offset = offset.clone();

        let mut bytes_sent = 0usize;

        async move {
            metrics.inc_active_decoders();

            defer!(metrics.dec_active_decoders());

            let mut stdout = stdout;
            let mut buffer = vec![0u8; STDIO_BUFFER_SIZE];

            let mut channel_closed = false;

            while let Some(Ok(bytes)) = read_from_stdout(&mut stdout, &mut buffer).await {
                if let Some(time) = start_time.take() {
                    metrics.update_audio_decoder_track_open_duration(time.elapsed());
                }

                let bytes_len = bytes.len();
                let decoding_time_seconds = bytes_sent as f64 / AUDIO_BYTES_PER_SECOND as f64;
                let decoding_time = Duration::from_secs_f64(decoding_time_seconds);
                let timed_bytes =
                    Buffer::new(bytes, decoding_time, decoding_time + offset, &format);

                if let Err(_) = tx.send(DecoderOutput::Buffer(timed_bytes)).await {
                    channel_closed = true;
                    break;
                };

                bytes_sent += bytes_len;
            }

            let decoding_time_seconds = bytes_sent as f64 / AUDIO_BYTES_PER_SECOND as f64;
            let decoding_time = Duration::from_secs_f64(decoding_time_seconds);
            let _ = tx
                .send(DecoderOutput::Buffer(Buffer::new(
                    Bytes::new(),
                    decoding_time,
                    decoding_time + offset,
                    &format,
                )))
                .await;
            let _ = tx.send(DecoderOutput::EOF).await;

            drop(stdout);

            if let Ok(exit_status) = status.await {
                match exit_status.code() {
                    Some(code) if code == 1 && channel_closed => {
                        debug!(
                            logger,
                            "Decoder exited because output channel has been closed"
                        );
                    }
                    Some(code) if code != 0 => {
                        warn!(logger, "Decoder exited with non-zero exit code"; "exit_code" => code);
                    }
                    _ => (),
                }
            }
        }
    });

    Ok(rx)
}

#[derive(thiserror::Error, Debug)]
pub(crate) enum EncoderError {
    #[error("Error while processing data")]
    ProcessError,
    #[error("Unable to access stdout")]
    StdoutUnavailable,
    #[error("Unable to access stdin")]
    StdinUnavailable,
}

pub(crate) fn build_ffmpeg_encoder(
    format: &AudioFormat,
    logger: &Logger,
    metrics: &Metrics,
) -> Result<(mpsc::Sender<Bytes>, mpsc::Receiver<Bytes>), EncoderError> {
    let logger = logger.new(o!("kind" => "ffmpeg_encoder"));

    let mut process = match Command::new(*FFMPEG_COMMAND)
        .args(&[
            "-v",
            "quiet",
            "-hide_banner",
            "-acodec",
            "pcm_s16le",
            "-ar",
            &AUDIO_SAMPLING_FREQUENCY.to_string(),
            "-ac",
            &AUDIO_CHANNELS_NUMBER.to_string(),
            "-f",
            "s16le",
            "-i",
            "-",
            // TODO Replace with apply of pre-computed audio peak level.
            // "-af",
            // "compand=0 0:1 1:-90/-900 -70/-70 -21/-21 0/-15:0.01:12:0:0",
            "-map_metadata",
            "-1",
            "-vn",
            "-ar",
            &AUDIO_SAMPLING_FREQUENCY.to_string(),
            "-ac",
            "2",
            "-b:a",
            &format!("{}k", format.bitrate),
            "-codec:a",
            &format.codec,
            "-f",
            &format.format,
            "-",
        ])
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()
    {
        Ok(process) => process,
        Err(error) => {
            error!(logger, "Unable to start encoder process: error occurred"; "error" => ?error);
            return Err(EncoderError::ProcessError);
        }
    };

    let stdout = match process.stdout.take() {
        Some(stdout) => stdout,
        None => {
            error!(
                logger,
                "Unable to start encoder process: stdout is not available"
            );
            return Err(EncoderError::StdoutUnavailable);
        }
    };

    let stdin = match process.stdin.take() {
        Some(stdin) => stdin,
        None => {
            error!(
                logger,
                "Unable to start encoder process: stdin is not available"
            );
            return Err(EncoderError::StdinUnavailable);
        }
    };

    let (term_signal, term_handler) = oneshot::channel::<()>();

    let (sink_sender, sink_receiver) = mpsc::channel(0);
    let (src_sender, src_receiver) = mpsc::channel(0);

    actix_rt::spawn({
        let mut sink_receiver = sink_receiver;
        let mut stdin = stdin;

        let logger = logger.clone();

        let pipe = async move {
            while let Some(bytes) = sink_receiver.next().await {
                if let Err(error) = write_to_stdin(&mut stdin, bytes).await {
                    error!(logger, "Unable to write data to encoder: error occurred"; "error" => ?error);
                    break;
                }
            }

            drop(stdin);
        };

        let abort = async move {
            let _ = term_handler.await;
        };

        abort.or(pipe)
    });

    actix_rt::spawn({
        let mut stdout = stdout;
        let mut src_sender = src_sender;

        let metrics = metrics.clone();
        let format_string = format.to_string();

        async move {
            metrics.inc_active_encoders(&format_string);

            defer!(metrics.dec_active_encoders(&format_string));

            let mut buffer = vec![0u8; STDIO_BUFFER_SIZE];
            while let Some(Ok(bytes)) = read_from_stdout(&mut stdout, &mut buffer).await {
                if let Err(_) = src_sender.send(bytes).await {
                    break;
                };
            }

            drop(stdout);

            let _ = term_signal.send(());
        }
    });

    Ok((sink_sender, src_receiver))
}