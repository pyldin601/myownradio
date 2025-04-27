pub(crate) const SAMPLE_RATE: u64 = 48000;
pub(crate) const CHANNELS: u64 = 2;
pub(crate) const BYTES_PER_SAMPLE: u64 = 2; // 16 bit
pub(crate) const BYTES_PER_FRAME: u64 = BYTES_PER_SAMPLE * CHANNELS;
pub(crate) const BYTES_TO_PTS_MULTIPLIER: f64 = 1.0 / (SAMPLE_RATE as f64 * BYTES_PER_FRAME as f64);
pub(crate) const SAMPLE_ENCODING: &str = "pcm_s16le";
pub(crate) const SAMPLE_FORMAT: &str = "s16le";
