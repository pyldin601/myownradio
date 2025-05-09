extern crate serde_millis;

use reqwest::StatusCode;
use serde::{Deserialize, Serialize};
use serde_repr::Deserialize_repr;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

const REQUEST_TIMEOUT: Duration = Duration::from_secs(5);

#[derive(Deserialize, Debug, Serialize)]
pub struct CurrentTrack {
    #[serde(with = "serde_millis")]
    pub offset: Duration,
    pub title: String,
    pub url: String,
    #[serde(with = "serde_millis")]
    pub duration: Duration,
}

#[derive(Debug, Deserialize_repr)]
#[repr(u8)]
pub enum PlaybackStatus {
    Stopped = 0,
    Playing = 1,
    Paused = 2,
}

#[derive(Deserialize, Debug)]
pub struct ChannelInfo {
    pub name: String,
    pub status: PlaybackStatus,
}

#[derive(Deserialize, Debug)]
pub struct GetChannelInfoResponse {
    pub code: u8,
    pub message: String,
    pub data: Option<ChannelInfo>,
}

#[derive(Deserialize, Debug)]
pub struct GetPlayingAtResponse {
    pub playback_status: PlaybackStatus,
    pub current_track: CurrentTrack,
}

#[derive(Clone)]
pub struct SchedulerClient {
    scheduler_endpoint: String,
}

#[derive(thiserror::Error, Debug)]
pub enum GetChannelInfoError {
    #[error(transparent)]
    RequestError(#[from] reqwest::Error),
    #[error("Channel {0} not found")]
    ChannelNotFound(u64),
    #[error("Unexpected response: {0:?}")]
    UnexpectedResponse(GetChannelInfoResponse),
}

#[derive(thiserror::Error, Debug)]
pub enum GetPlayingAtError {
    #[error(transparent)]
    RequestError(#[from] reqwest::Error),
    #[error("Channel {0} not found")]
    ChannelNotFound(u64),
}

impl SchedulerClient {
    pub fn new(scheduler_endpoint: &str) -> Self {
        let scheduler_endpoint = scheduler_endpoint.to_string();

        Self { scheduler_endpoint }
    }

    pub async fn get_channel_info(
        &self,
        channel_id: &u64,
        client_id: Option<String>,
    ) -> Result<ChannelInfo, GetChannelInfoError> {
        let client = reqwest::Client::builder()
            .timeout(REQUEST_TIMEOUT)
            .build()
            .expect("Unable to initialize HTTP client");

        let url = format!(
            "{}/pub/v0/streams/{}/info?client_id={}",
            &self.scheduler_endpoint,
            &channel_id,
            &client_id.unwrap_or_default(),
        );

        let response: GetChannelInfoResponse = client
            .get(url)
            .timeout(Duration::from_secs(5))
            .send()
            .await?
            .error_for_status()
            .map_err(|error| {
                if matches!(error.status(), Some(StatusCode::NOT_FOUND)) {
                    GetChannelInfoError::ChannelNotFound(*channel_id)
                } else {
                    error.into()
                }
            })?
            .json()
            .await?;

        match response {
            GetChannelInfoResponse {
                code,
                message,
                data: None,
            } if (code == 0 && message == "Stream not found") => {
                Err(GetChannelInfoError::ChannelNotFound(*channel_id))
            }
            GetChannelInfoResponse {
                code,
                message,
                data: Some(data),
            } if (code == 1 && message == "OK") => Ok(data),
            GetChannelInfoResponse { .. } => Err(GetChannelInfoError::UnexpectedResponse(response)),
        }
    }

    pub async fn get_playing_at(
        &self,
        channel_id: &u64,
        time: &SystemTime,
    ) -> Result<GetPlayingAtResponse, GetPlayingAtError> {
        let client = reqwest::Client::builder()
            .timeout(REQUEST_TIMEOUT)
            .build()
            .expect("Unable to initialize HTTP client");

        let unix_time = time.duration_since(UNIX_EPOCH).unwrap().as_millis();

        let url = format!(
            "{}/internal/audio-composer/channel/{}/playing-at/{}",
            &self.scheduler_endpoint, channel_id, &unix_time,
        );

        let response = client
            .get(url)
            .send()
            .await?
            .error_for_status()
            .map_err(|error| {
                if matches!(error.status(), Some(StatusCode::NOT_FOUND)) {
                    GetPlayingAtError::ChannelNotFound(*channel_id)
                } else {
                    error.into()
                }
            })?
            .json()
            .await?;

        Ok(response)
    }
}
