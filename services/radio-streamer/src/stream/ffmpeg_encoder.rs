use crate::audio_formats::AudioFormat;
use crate::helpers::io::{read_from_stdout, write_to_stdin};
use crate::metrics::Metrics;
use crate::stream::constants::{AUDIO_CHANNELS_NUMBER, AUDIO_SAMPLING_FREQUENCY};
use crate::stream::types::TimedBuffer;
use actix_web::web::Bytes;
use async_process::{Command, Stdio};
use futures::channel::{mpsc, oneshot};
use futures::{select, SinkExt, StreamExt};
use futures_lite::FutureExt;
use slog::{error, o, Logger};

const STDIO_BUFFER_SIZE: usize = 4096;

#[derive(Debug)]
pub(crate) enum EncoderError {
    ProcessError,
    StdoutUnavailable,
    StdinUnavailable,
}

pub(crate) fn make_ffmpeg_encoder(
    format: &AudioFormat,
    path_to_ffmpeg: &str,
    logger: &Logger,
    metrics: &Metrics,
) -> Result<(mpsc::Sender<Bytes>, mpsc::Receiver<Bytes>), EncoderError> {
    let logger = logger.new(o!("kind" => "ffmpeg_encoder"));

    let process = match Command::new(&path_to_ffmpeg)
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
            "-af",
            "compand=0 0:1 1:-90/-900 -70/-70 -21/-21 0/-15:0.01:12:0:0",
            "-map_metadata",
            "-1",
            "-vn",
            "-ar",
            "44100",
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

    let stdout = match process.stdout {
        Some(stdout) => stdout,
        None => {
            error!(
                logger,
                "Unable to start encoder process: stdout is not available"
            );
            return Err(EncoderError::StdoutUnavailable);
        }
    };

    let stdin = match process.stdin {
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
        };

        let abort = async move {
            let _ = term_handler.await;
        };

        abort.or(pipe)
    });

    actix_rt::spawn({
        let mut stdout = stdout;
        let mut src_sender = src_sender;

        let logger = logger.clone();
        let metrics = metrics.clone();

        async move {
            metrics.inc_spawned_encoder_processes();

            let mut buffer = vec![0u8; STDIO_BUFFER_SIZE];
            while let Some(Ok(bytes)) = read_from_stdout(&mut stdout, &mut buffer).await {
                if let Err(error) = src_sender.send(bytes).await {
                    error!(logger, "Unable to send data from encoder: I/O error"; "error" => ?error);
                    break;
                };
            }

            metrics.dec_spawned_encoder_processes();

            let _ = term_signal.send(());
        }
    });

    Ok((sink_sender, src_receiver))
}