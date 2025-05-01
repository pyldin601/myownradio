use crate::config::Config;
use crate::data_structures::StreamId;
use crate::http_server::response::Response;
use crate::mysql_client::MySqlClient;
use crate::services;
use crate::storage::db::repositories::streams;
use crate::storage::db::repositories::user_stream_tracks::TrackFileLinkMergedRow;
use actix_web::{web, HttpResponse};
use std::time::UNIX_EPOCH;

fn get_artist_and_title(row: &TrackFileLinkMergedRow) -> String {
    format!("{} - {}", row.track.artist, row.track.title)
}

fn get_file_path(row: &TrackFileLinkMergedRow) -> String {
    format!(
        "{}/{}/{}.{}",
        &row.file.file_hash[..1],
        &row.file.file_hash[1..2],
        row.file.file_hash,
        row.file.file_extension
    )
}

pub(crate) async fn get_playing_at(
    path: web::Path<(StreamId, u64)>,
    config: web::Data<Config>,
    mysql_client: web::Data<MySqlClient>,
) -> Response {
    let (stream_id, unix_time) = path.into_inner();
    let system_time = UNIX_EPOCH + std::time::Duration::from_millis(unix_time);

    let mut connection = mysql_client.connection().await?;

    let stream = {
        match streams::get_single_stream_by_id(&mut connection, &stream_id).await? {
            Some(stream) => stream,
            None => return Ok(HttpResponse::NotFound().finish()),
        }
    };

    let (current_track, next_track, current_position, status) = {
        match services::get_now_playing(&system_time, &stream_id, &mut connection).await? {
            Some(now_playing) => now_playing,
            None => return Ok(HttpResponse::Conflict().finish()),
        }
    };

    let offset = current_position.num_milliseconds();
    let title = get_artist_and_title(&current_track);
    let url = format!(
        "{}audio/{}",
        config.file_server_endpoint,
        get_file_path(&current_track)
    );
    let duration = current_track.track.duration;

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "playback_status": status,
        "current_track": {
            "offset": offset,
            "title": title,
            "url": url,
            "duration": duration,
        }
    })))
}
