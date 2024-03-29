mod ffmpeg;
mod generator;
mod transcoder;
mod transcoder_async;
mod utils;

pub use ffmpeg_next::init;
pub use generator::generate_silence;
pub use transcoder::{AudioTranscoder, OutputFormat, TranscoderCreationError, TranscodingError};
pub use transcoder_async::AudioTranscoderAsync;
pub use utils::{Frame, Packet, Timestamp};

// The sampling rate used internally by the program, in Hz.
const INTERNAL_SAMPLING_FREQUENCY: i64 = 48_000;

// The timebase used internally by the program, expressed as a ratio of time units.
const INTERNAL_TIME_BASE: (i32, i32) = (1, 1000);

// The timebase used by the audio resampler, expressed as a ratio of time units.
const RESAMPLER_TIME_BASE: (i32, i32) = (1, INTERNAL_SAMPLING_FREQUENCY as i32);
