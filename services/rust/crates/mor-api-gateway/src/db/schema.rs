use diesel::table;

table! {
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
