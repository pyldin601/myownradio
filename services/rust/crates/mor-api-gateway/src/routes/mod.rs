use actix_web::{web, Scope};

mod channel_tracks;
mod channels;
mod files;
mod tracks;
mod users;

pub(crate) fn get_routes() -> Scope {
    web::scope("")
        // User routes
        .service(
            web::resource("/users")
                .get(users::list_users)
                .post(users::create_user),
        )
        .service(web::resource("/users/by-email/{email}").get(users::get_user_by_email))
        .service(
            web::resource("/users/{userId}")
                .get(users::get_user)
                .put(users::update_user)
                .delete(users::delete_user),
        )
        // User tracks routes
        .service(
            web::resource("/users/{userId}/tracks")
                .get(tracks::list_tracks)
                .post(tracks::create_track),
        )
        .service(
            web::resource("/users/{userId}/tracks/{trackId}")
                .get(tracks::get_track)
                .put(tracks::update_track)
                .delete(tracks::delete_track),
        )
        // User channels routes
        .service(
            web::resource("/users/{userId}/channels")
                .get(channels::list_channels)
                .post(channels::create_channel),
        )
        .service(
            web::resource("/users/{userId}/channels/{channelId}")
                .get(channels::get_channel)
                .put(channels::update_channel)
                .delete(channels::delete_channel),
        )
        // Channel tracks routes
        .service(
            web::resource("/users/{userId}/channels/{channelId}/tracks")
                .get(channel_tracks::list_tracks)
                .post(channel_tracks::add_track),
        )
        .service(
            web::resource("/users/{userId}/channels/{channelId}/tracks/{trackId}")
                .delete(channel_tracks::delete_track),
        )
        .service(
            web::resource("/users/{userId}/channels/{channelId}/tracks/{trackId}/reorder")
                .post(channel_tracks::reorder_track),
        )
        // Files
        .service(
            web::resource("/files/{fileId}")
                .get(files::get_file)
                .delete(files::delete_file)
                .put(files::update_file),
        )
        .service(web::resource("/files").get(files::add_file))
}
