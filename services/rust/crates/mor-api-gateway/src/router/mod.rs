use actix_web::web;

mod auth;
mod channel_tracks;
mod channels;
mod files;
mod me;
mod public;
mod tracks;
mod users;

pub(crate) fn configure(cfg: &mut web::ServiceConfig) {
    // --------- /me (Authenticated User) ---------
    cfg.service(
        web::scope("/me")
            // Profile / Dashboard
            .service(
                web::resource("/profile")
                    .get(me::profile::get_profile)
                    .put(me::profile::update_profile),
            )
            .service(web::resource("/profile/picture").put(me::profile::update_picture))
            .service(web::resource("/profile/password").put(me::profile::change_password))
            // Channels (owned)
            .service(
                web::resource("/channels")
                    .get(me::channels::list_channels)
                    .post(me::channels::create_channel),
            )
            .service(
                web::resource("/channels/{channelId}")
                    .put(me::channels::edit_channel)
                    .delete(me::channels::delete_channel),
            )
            .service(
                web::resource("/channels/{channelId}/picture")
                    .put(me::channels::update_channel_picture),
            )
            // Tracks (owned)
            .service(
                web::resource("/tracks")
                    .get(me::tracks::list_tracks)
                    .post(me::tracks::upload_track),
            )
            .service(web::resource("/tracks/unused").get(me::tracks::list_unused_tracks))
            .service(web::resource("/tracks/search").get(me::tracks::search_tracks))
            .service(
                web::resource("/tracks/{trackId}/add-to-channel").post(me::tracks::add_to_channel),
            )
            .service(web::resource("/tracks/{trackId}/color").put(me::tracks::change_color))
            .service(web::resource("/tracks/bulk/edit").put(me::tracks::edit_multiple_tracks))
            .service(
                web::resource("/tracks/bulk/delete").delete(me::tracks::delete_multiple_tracks),
            )
            .service(web::resource("/tracks/{trackId}/download").get(me::tracks::download))
            .service(web::resource("/tracks/{trackId}/preview").get(me::tracks::preview)),
    );

    // --------- /auth (Authentication) ---------
    cfg.service(
        web::scope("/auth")
            .service(web::resource("/login").post(auth::auth::login))
            .service(web::resource("/signup").post(auth::auth::signup))
            .service(web::resource("/reset-password").post(auth::auth::reset_password)),
    );

    // --------- /public (Public Access) ---------
    cfg.service(
        web::scope("/public")
            // Channels
            .service(web::resource("/channels").get(public::channels::list_channels)) // ?filter=new/popular/recent/own/bookmarked
            .service(web::resource("/channels/{channelId}").get(public::channels::get_channel_info))
            .service(
                web::resource("/channels/{channelId}/similar")
                    .get(public::channels::similar_channels),
            )
            .service(web::resource("/search/channels").get(public::channels::search_channels))
            // Categories
            .service(web::resource("/categories").get(public::categories::list_categories))
            // Schedule
            .service(web::resource("/now-playing").get(public::schedule::bulk_now_playing))
            .service(
                web::resource("/channels/{channelId}/now-playing")
                    .get(public::schedule::now_playing),
            )
            .service(
                web::resource("/channels/{channelId}/timeline").get(public::schedule::get_timeline),
            ),
    );

    cfg
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
        .service(web::resource("/files").get(files::add_file));
}
