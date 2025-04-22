use std::time::SystemTime;

pub(crate) struct Composer {
    channel_id: u64,
    initial_time: SystemTime,
    sample_rate: u32,
}

impl Composer {
    pub(crate) fn create(channel_id: u64, initial_time: SystemTime, sample_rate: u32) -> Self {
        Self {
            channel_id,
            initial_time,
            sample_rate,
        }
    }
}
