use actix_web::client::Client;
use actix_web::http::StatusCode;
use serde::{Deserialize, Serialize};
use slog::{error, Logger};

#[derive(Deserialize, Debug, Serialize)]
pub struct CurrentTrack {
    pub offset: u32,
    pub title: String,
    pub url: String,
}

#[derive(Deserialize, Debug, Serialize)]
pub struct NextTrack {
    pub title: String,
    pub url: String,
}

#[derive(Deserialize, Debug)]
pub struct NowPlaying {
    pub time: f32,
    pub playlist_position: u32,
    pub current_track: CurrentTrack,
    pub next_track: NextTrack,
}

#[derive(Deserialize, Debug)]
pub struct NowPlayingResponse {
    pub code: u8,
    pub message: String,
    pub data: NowPlaying,
}

#[derive(Deserialize, Debug)]
pub struct ChannelInfo {
    pub name: String,
    pub status: u8,
}

#[derive(Deserialize, Debug)]
pub struct ChannelInfoResponse {
    pub code: u8,
    pub message: String,
    pub data: Option<ChannelInfo>,
}

pub struct MorBackendClient {
    logger: Logger,
    mor_backend_url: String,
}

#[derive(Debug)]
pub enum MorBackendClientError {
    SendRequestError,
    UnexpectedStatusCode,
    ResponseReadError,
    ResponseParseError,
    UnexpectedResponse,
    ChannelNotFound,
}

impl MorBackendClient {
    pub fn new(mor_backend_url: &str, logger: &Logger) -> Self {
        Self {
            logger: logger.clone(),
            mor_backend_url: mor_backend_url.to_string(),
        }
    }

    pub async fn get_now_playing(
        &self,
        channel_id: &u32,
    ) -> Result<NowPlaying, MorBackendClientError> {
        let client = Client::default();

        let url = format!("{}/api/v1/stream/{}/now", &self.mor_backend_url, channel_id);

        let mut response = match client.get(url).send().await {
            Ok(response) => response,
            Err(error) => {
                error!(self.logger, "Unable to send request"; "error" => ?error);
                return Err(MorBackendClientError::SendRequestError);
            }
        };

        let body = match response.status() {
            StatusCode::OK => response.body().await,
            StatusCode::NOT_FOUND => return Err(MorBackendClientError::ChannelNotFound),
            status_code => {
                error!(self.logger, "Unexpected status code"; "status_code" => ?status_code);
                return Err(MorBackendClientError::UnexpectedStatusCode);
            }
        };

        let bytes = match body {
            Ok(bytes) => bytes,
            Err(error) => {
                error!(self.logger, "Unable to read response"; "error" => ?error);
                return Err(MorBackendClientError::ResponseReadError);
            }
        };

        match serde_json::from_slice::<NowPlayingResponse>(&bytes) {
            Ok(NowPlayingResponse {
                code,
                message,
                data,
            }) if (code == 1 && message == "OK") => Ok(data),
            Ok(NowPlayingResponse { .. }) => {
                error!(
                    self.logger,
                    "Response has unexpected code or message"; "response" => ?bytes
                );
                Err(MorBackendClientError::UnexpectedResponse)
            }
            Err(error) => {
                error!(self.logger, "Unable to parse response"; "error" => ?error);
                Err(MorBackendClientError::ResponseParseError)
            }
        }
    }

    pub async fn get_channel_info(
        &self,
        channel_id: &u32,
    ) -> Result<ChannelInfo, MorBackendClientError> {
        let client = Client::default();

        let url = format!(
            "{}/api/v0/stream/{}/info",
            &self.mor_backend_url, channel_id
        );

        let mut response = match client.get(url).send().await {
            Ok(response) => response,
            Err(error) => {
                error!(self.logger, "Unable to send request"; "error" => ?error);
                return Err(MorBackendClientError::SendRequestError);
            }
        };

        let body = match response.status() {
            StatusCode::OK => response.body().await,
            status_code => {
                error!(self.logger, "Unexpected status code"; "status_code" => ?status_code);
                return Err(MorBackendClientError::UnexpectedStatusCode);
            }
        };

        let bytes = match body {
            Ok(bytes) => bytes,
            Err(error) => {
                error!(self.logger, "Unable to read response"; "error" => ?error);
                return Err(MorBackendClientError::ResponseReadError);
            }
        };

        match serde_json::from_slice::<ChannelInfoResponse>(&bytes) {
            Ok(ChannelInfoResponse {
                code,
                message,
                data: None,
            }) if (code == 0 && message == "Stream not found") => {
                return Err(MorBackendClientError::ChannelNotFound);
            }
            Ok(ChannelInfoResponse {
                code,
                message,
                data: Some(data),
            }) if (code == 1 && message == "OK") => Ok(data),
            Ok(ChannelInfoResponse { .. }) => {
                error!(
                    self.logger,
                    "Response has unexpected code or message"; "response" => ?bytes
                );
                Err(MorBackendClientError::UnexpectedResponse)
            }
            Err(error) => {
                error!(self.logger, "Unable to parse response"; "error" => ?error);
                Err(MorBackendClientError::ResponseParseError)
            }
        }
    }
}