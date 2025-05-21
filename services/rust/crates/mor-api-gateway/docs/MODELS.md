# Models

## 🧑‍💻 User

Represents a registered user in the system.

```jsonc
{
  "uid": 123,                       // Unique user ID
  "mail": "user@example.com",       // Email address (required)
  "login": "cool_username",         // Optional username/login
  "password": null,                 // Optional password hash (null if not set)
  "name": "John Doe",               // Optional display name
  "country_id": 250,                // Optional country reference (e.g., ISO country code as int)
  "info": "Just a user",            // Optional bio or user info
  "rights": 1,                      // Optional bitmask or role level
  "registration_date": 1672531200,  // Registration timestamp (Unix time, seconds)
  "last_visit_date": 1675180800,    // Optional last login timestamp (Unix time, seconds)
  "permalink": "john-doe",          // Optional permalink/slug for the profile
  "avatar": "avatar123.png",        // Optional avatar file name or URL
  "is_enabled": 1                   // Active status (1 = enabled, 0 = disabled)
}
```

## 📻 Channel

Represents a radio channel created by a user.

```jsonc
{
  "id": 456,                             // Channel ID
  "user_id": 123,                        // Owner user ID
  "name": "Late Night Vibes",            // Channel name
  "permalink": "late-night-vibes",       // Optional channel slug
  "info": "Smooth jazz and ambient",     // Description or about info
  "jingle_interval": 30,                 // Interval in seconds between jingles
  "status": 1,                           // Status code (e.g., active, paused)
  "started": 1675286400,                 // Optional last started timestamp
  "started_from": 1675282800,            // Optional stream origin timestamp
  "access": "public",                    // Access type (e.g., "public", "private")
  "category": 4,                         // Optional category ID (e.g., genre)
  "hashtags": "#jazz #chill",            // Hashtags associated with the channel
  "cover": "cover.jpg",                  // Optional cover image file name
  "cover_background": "bg.png",          // Optional background image file
  "created": 1672531200,                 // Channel creation timestamp (Unix time)
  "rtmp_url": "rtmp://stream.mydomain",  // RTMP base URL for stream input
  "rtmp_streaming_key": "abc123xyz"      // RTMP streaming key
}
```

## 🎵 Track

Represents an uploaded audio track owned by a user.

```jsonc
{
  "id": 101,                        // Track ID (originally 'tid' in the DB)
  "user_id": 123,                   // ID of the user who uploaded the track
  "file_id": 456,                   // Optional reference to a file in storage
  "filename": "groove.mp3",         // Original filename
  "hash": "abc123def456",           // Hash of the file for deduplication
  "ext": "mp3",                     // File extension
  "artist": "DJ Cool",              // Artist name
  "title": "Late Night Groove",     // Track title
  "album": "Jazz Vibes",            // Album name
  "track_number": "4",              // Track number in album
  "genre": "Jazz",                  // Genre of the track
  "date": "2023",                   // Year or release date as string
  "cue": null,                      // Optional cue sheet or time info
  "buy": null,                      // Optional buy link or reference
  "duration": 215,                  // Duration in seconds
  "filesize": 5242880,              // File size in bytes
  "color": 16777215,                // Visual tag or waveform color (e.g. RGB int)
  "uploaded": 1672531200,           // Upload timestamp (Unix time)
  "copy_of": null,                  // Optional reference to original if copied
  "used_count": 8,                  // Number of times this track has been reused
  "is_new": 1,                      // Whether the track is marked as "new"
  "can_be_shared": 1,               // Whether the track is shareable
  "is_deleted": 0,                  // Deletion status flag (1 = deleted)
  "deleted": null                   // Optional deletion timestamp
}
```

## 📻 Channel Track

Represents a track in the channel's playlist.

```jsonc
{
  "position": 2,                        // Order of the track in the channel
  "unique_id": "xyz987",                // Unique identifier for the track in this context
  "time_offset": 5000,                  // Start offset in milliseconds (relative to stream time)

  // --- Track fields below ---
  "id": 101,                            // Track ID (from r_tracks.tid)
  "user_id": 123,                       // Owner of the track
  "file_id": 456,                       // Optional file storage reference
  "filename": "groove.mp3",             // Original filename
  "hash": "abc123def456",               // File hash
  "ext": "mp3",                         // File extension
  "artist": "DJ Cool",                  // Artist name
  "title": "Late Night Groove",         // Track title
  "album": "Jazz Vibes",                // Album name
  "track_number": "4",                  // Track number in album
  "genre": "Jazz",                      // Track genre
  "date": "2023",                       // Year or date string
  "cue": null,                          // Optional cue sheet
  "buy": null,                          // Optional purchase link
  "duration": 215,                      // Track duration (in seconds)
  "filesize": 5242880,                  // File size in bytes
  "color": 16777215,                    // Visual waveform color or theme
  "uploaded": 1672531200,               // Unix timestamp of upload
  "copy_of": null,                      // Reference to original if duplicated
  "used_count": 8,                      // How many times this track was used
  "is_new": 1,                          // Whether track is marked as new
  "can_be_shared": 1,                   // Whether the track can be shared
  "is_deleted": 0,                      // Deletion flag (1 = deleted)
  "deleted": null                       // Optional deletion timestamp
}
```
