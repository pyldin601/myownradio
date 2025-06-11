diesel::table! {
    r_users (uid) {
        uid -> Integer,
        mail -> VarChar,
        login -> Nullable<VarChar>,
        password -> Nullable<VarChar>,
        name -> Nullable<VarChar>,
        country_id -> Nullable<Integer>,
        info -> Nullable<VarChar>,
        rights -> Nullable<Integer>,
        registration_date -> Unsigned<Integer>,
        last_visit_date -> Nullable<Unsigned<Integer>>,
        permalink -> Nullable<VarChar>,
        avatar -> Nullable<VarChar>,
        is_enabled -> TinyInt,
    }
}

diesel::table! {
    r_streams (sid) {
        sid -> Integer,
        uid -> Integer,
        name -> Text,
        permalink -> Nullable<Text>,
        info -> Text,
        jingle_interval -> Integer,
        status -> Integer,
        started -> Nullable<BigInt>,
        started_from -> Nullable<BigInt>,
        access -> Text,
        category -> Nullable<Integer>,
        hashtags -> Text,
        cover -> Nullable<Text>,
        cover_background -> Nullable<Text>,
        created -> BigInt,
        rtmp_url -> Text,
        rtmp_streaming_key -> Text
    }
}

diesel::joinable!(r_streams -> r_users (uid));

diesel::table! {
    r_tracks (tid) {
        tid -> Integer,
        file_id -> Nullable<Integer>,
        uid -> Integer,
        filename -> VarChar,
        hash -> VarChar,
        ext -> VarChar,
        artist -> VarChar,
        title -> VarChar,
        album -> VarChar,
        track_number -> VarChar,
        genre -> VarChar,
        date -> VarChar,
        cue -> Nullable<Text>,
        buy -> Nullable<VarChar>,
        duration -> Integer,
        filesize -> Integer,
        color -> Integer,
        uploaded -> Integer,
        copy_of -> Nullable<Integer>,
        used_count -> Integer,
        is_new -> TinyInt,
        can_be_shared -> TinyInt,
        is_deleted -> TinyInt,
        deleted -> Nullable<Integer>
    }
}

diesel::joinable!(r_tracks -> r_users (uid));

diesel::table! {
    r_link (id) {
        id -> BigInt,
        stream_id -> Integer,
        track_id -> Integer,
        t_order -> Integer,
        unique_id -> VarChar,
        time_offset -> BigInt
    }
}

diesel::joinable!(r_link -> r_tracks (track_id));
diesel::joinable!(r_link -> r_streams (stream_id));
diesel::allow_tables_to_appear_in_same_query!(r_link, r_tracks);

diesel::table! {
    fs_file (file_id) {
        file_id -> Integer,
        file_size -> BigInt,
        file_hash -> VarChar,
        file_extension -> VarChar,
        server_id -> Integer,
        use_count -> Integer
    }
}

diesel::joinable!(fs_file -> fs_list (server_id));

diesel::table! {
    fs_list (fs_id) {
        fs_id -> Integer,
        is_online -> TinyInt,
        is_enabled -> TinyInt,
        fs_host -> VarChar,
        files_count -> Integer
    }
}

diesel::table! {
    r_sessions (token) {
        token -> VarChar,
        uid -> Integer,
        ip -> VarChar,
        client_id -> VarChar,
        authorized -> Timestamp,
        http_user_agent -> VarChar,
        session_id -> VarChar,
        permanent -> TinyInt,
        expires -> Nullable<Timestamp>
    }
}

diesel::joinable!(r_sessions -> r_users (uid));
