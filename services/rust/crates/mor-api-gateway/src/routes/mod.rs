use actix_web::{web, Scope};

mod channel_tracks;
mod channels;
mod tracks;
mod users;

pub(crate) fn get_routes() -> Scope {
    web::scope("/users")
        .service(
            web::resource("")
                .get(users::list_users)
                .post(users::create_user),
        )
        .service(
            web::scope("/{userId}")
                .service(
                    web::resource("")
                        .get(users::get_user)
                        .put(users::update_user)
                        .delete(users::delete_user),
                )
                .service(
                    web::scope("/tracks")
                        .service(
                            web::resource("")
                                .get(tracks::list_tracks)
                                .post(tracks::create_track),
                        )
                        .service(
                            web::resource("/{trackId}")
                                .get(tracks::get_track)
                                .put(tracks::update_track)
                                .delete(tracks::delete_track),
                        ),
                )
                .service(
                    web::scope("/channels")
                        .service(
                            web::resource("")
                                .get(channels::list_channels)
                                .post(channels::create_channel),
                        )
                        .service(
                            web::scope("/{channelId}")
                                .service(
                                    web::resource("")
                                        .get(channels::get_channel)
                                        .put(channels::update_channel)
                                        .delete(channels::delete_channel),
                                )
                                .service(
                                    web::scope("/tracks")
                                        .service(
                                            web::resource("")
                                                .get(channel_tracks::list_tracks)
                                                .post(channel_tracks::add_track),
                                        )
                                        .service(
                                            web::resource("/{trackId}")
                                                .delete(channel_tracks::delete_track),
                                        )
                                        .service(
                                            web::resource("/{trackId}/reorder")
                                                .post(channel_tracks::reorder_track),
                                        ),
                                ),
                        ),
                ),
        )
}
