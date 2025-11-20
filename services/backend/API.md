# API Documentation

## Base URL

All API endpoints are prefixed with `/api/v2/`

## Authentication

The API uses session-based authentication via JWT tokens stored in cookies. The session cookie is named `secure_session`.

### Authentication Flow

1. **Login**: `POST /api/v2/user/login`
2. **Session Token**: After successful login, a session token is stored in a cookie
3. **Authenticated Requests**: Include the session cookie in subsequent requests
4. **Unauthenticated Requests**: Some endpoints work without authentication (public channels, etc.)

### Authentication Errors

- **401 Unauthorized**: Returned when authentication is required but not provided
- Error response format:
```json
{
  "code": 0,
  "message": "Unauthorized message",
  "data": null
}
```

## Response Format

All API responses follow a standard JSON format:

```json
{
  "code": 1,
  "message": "OK",
  "data": { ... }
}
```

### Response Fields

- `code`: Status code (1 = success, 0 = error)
- `message`: Human-readable message
- `data`: Response payload (varies by endpoint)

### HTTP Status Codes

- `200 OK`: Successful request
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Pagination

Many list endpoints support pagination via query parameters:

- `offset` (integer, default: 0): Number of items to skip
- `limit` (integer, default: varies by endpoint): Maximum number of items to return

## Endpoints

### Authentication & User Management

#### Login
```http
POST /api/v2/user/login
```

**Request Body:**
```json
{
  "login": "username_or_email",
  "password": "password",
  "remember": false
}
```

**Response:**
```json
{
  "code": 1,
  "message": "OK",
  "data": {
    "uid": 123,
    "login": "username",
    "name": "User Name",
    "email": "user@example.com",
    "avatar": "avatar.jpg",
    "permalink": "user-permalink"
  }
}
```

#### Sign Up (Begin)
```http
POST /api/v2/user/signUpBegin
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "code": 1,
  "message": "OK",
  "data": null
}
```

#### Sign Up (Complete)
```http
POST /api/v2/user/signUpComplete
```

**Request Body:**
```json
{
  "code": "verification_code",
  "login": "username",
  "password": "password",
  "name": "User Name"
}
```

#### Password Reset (Begin)
```http
POST /api/v2/user/passwordResetBegin
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### Password Reset (Complete)
```http
POST /api/v2/user/passwordResetComplete
```

**Request Body:**
```json
{
  "code": "reset_code",
  "password": "new_password"
}
```

#### Facebook Login
```http
POST /api/v2/user/fbLogin
```

**Request Body:**
```json
{
  "access_token": "facebook_access_token"
}
```

#### Get Current User
```http
GET /api/v2/self
```

**Authentication:** Required

**Response:**
```json
{
  "code": 1,
  "message": "OK",
  "data": {
    "user": {
      "uid": 123,
      "login": "username",
      "name": "User Name",
      "email": "user@example.com",
      "avatar_url": "https://...",
      "permalink": "user-permalink"
    },
    "streams": [ ... ],
    "client_id": "client_id_string"
  }
}
```

#### Update Current User
```http
POST /api/v2/self
```

**Authentication:** Required

**Request Body:**
```json
{
  "name": "New Name",
  "email": "newemail@example.com"
}
```

#### Change Password
```http
POST /api/v2/self/changePassword
```

**Authentication:** Required

**Request Body:**
```json
{
  "login": "username",
  "password": "current_password",
  "new_password": "new_password",
  "remember": false
}
```

#### Delete Account
```http
POST /api/v2/self/delete
```

**Authentication:** Required

### Channels

Channels (also called streams) are radio stations that users can create and manage.

#### Get All Channels
```http
GET /api/v2/channels/all
```

**Query Parameters:**
- `offset` (integer, default: 0)
- `limit` (integer, default: 50, max: 50)

**Response:**
```json
{
  "code": 1,
  "message": "OK",
  "data": {
    "channels": {
      "count": 10,
      "items": [
        {
          "sid": 123,
          "uid": 456,
          "name": "Channel Name",
          "permalink": "channel-permalink",
          "info": "Channel description",
          "hashtags": "tag1, tag2",
          "access": "PUBLIC",
          "status": 1,
          "cover": "cover.jpg",
          "cover_background": "#ffffff",
          "created": "2024-01-01 00:00:00",
          "bookmarks_count": 10,
          "listeners_count": 5,
          "is_featured": 0,
          "playbacks": 100,
          "bookmarked": false,
          "now_playing": "Artist - Track Title",
          "time_left": 120
        }
      ]
    }
  }
}
```

#### Get Popular Channels
```http
GET /api/v2/channels/popular
```

**Query Parameters:**
- `offset` (integer, default: 0)
- `limit` (integer, default: 50, max: 50)

#### Get New Channels
```http
GET /api/v2/channels/new
```

**Query Parameters:**
- `offset` (integer, default: 0)
- `limit` (integer, default: 50, max: 50)

#### Get Recent Channels
```http
GET /api/v2/channels/recent
```

**Query Parameters:**
- `offset` (integer, default: 0)
- `limit` (integer, default: 50, max: 50)

#### Get Random Channel
```http
GET /api/v2/channels/random
```

**Response:**
```json
{
  "code": 1,
  "message": "OK",
  "data": {
    "channels": {
      "items": [ ... ]
    }
  }
}
```

#### Get Channel by ID
```http
GET /api/v2/channels/one
```

**Query Parameters:**
- `channel_id` (string, required): Channel ID or permalink

#### Search Channels
```http
GET /api/v2/channels/search
```

**Query Parameters:**
- `filter` (string, required): Search query
- `offset` (integer, default: 0)
- `limit` (integer, default: 50, max: 50)

#### Get Channel Suggestions
```http
GET /api/v2/channels/suggest
```

**Query Parameters:**
- `filter` (string, required): Search query

**Response:** Returns up to 5 suggestions

#### Get Channels by Category
```http
GET /api/v2/channels/category
```

**Query Parameters:**
- `category_id` (integer, required)
- `offset` (integer, default: 0)
- `limit` (integer, default: 50, max: 50)

#### Get Channels by Tag
```http
GET /api/v2/channels/tag
```

**Query Parameters:**
- `tag` (string, required)
- `offset` (integer, default: 0)
- `limit` (integer, default: 50, max: 50)

#### Get Channels by User
```http
GET /api/v2/channels/user
```

**Query Parameters:**
- `user_id` (integer, required)
- `offset` (integer, default: 0)
- `limit` (integer, default: 50, max: 50)

#### Get My Channels
```http
GET /api/v2/channels/my
```

**Authentication:** Required

**Query Parameters:**
- `offset` (integer, default: 0)
- `limit` (integer, default: 50, max: 50)

#### Get Bookmarked Channels
```http
GET /api/v2/channels/bookmarks
```

**Authentication:** Required

**Query Parameters:**
- `offset` (integer, default: 0)
- `limit` (integer, default: 50, max: 50)

#### Get Similar Channels
```http
GET /api/v2/channels/similar
```

**Query Parameters:**
- `channel_id` (string, required): Channel ID or permalink

**Response:** Returns up to 10 similar channels

### Streams

Streams endpoints provide detailed stream information and management.

#### Get Stream
```http
GET /api/v2/streams/getOne
```

**Query Parameters:**
- `stream_id` (string, required): Stream ID or permalink

**Response:**
```json
{
  "code": 1,
  "message": "OK",
  "data": {
    "sid": 123,
    "uid": 456,
    "name": "Stream Name",
    "permalink": "stream-permalink",
    "info": "Stream description",
    "hashtags": "tag1, tag2",
    "hashtags_array": ["tag1", "tag2"],
    "category": 1,
    "status": 1,
    "access": "PUBLIC",
    "cover": "cover.jpg",
    "cover_url": "https://...",
    "cover_background": "#ffffff",
    "created": "2024-01-01 00:00:00",
    "bookmarks_count": 10,
    "listeners_count": 5,
    "tracks_count": 50,
    "tracks_duration": 3600,
    "bookmarked": false,
    "key": "stream-permalink",
    "url": "https://...",
    "owner": {
      "uid": 456,
      "login": "username",
      "name": "User Name",
      "permalink": "user-permalink",
      "avatar": "avatar.jpg",
      "avatar_url": "https://...",
      "key": "user-permalink"
    }
  }
}
```

#### Get Stream List
```http
GET /api/v2/streams/getList
```

**Query Parameters:**
- `filter` (string, optional): Search query or hashtag (prefix with #)
- `category` (integer, optional)
- `offset` (integer, default: 0)
- `limit` (integer, default: varies)

#### Get Streams by User
```http
GET /api/v2/streams/getStreamsByUser
```

**Query Parameters:**
- `user_id` (string, required): User ID or permalink
- `offset` (integer, default: 0)
- `limit` (integer, default: varies)

#### Get Similar Streams
```http
GET /api/v2/streams/getSimilarTo
```

**Query Parameters:**
- `stream_id` (string, required)

#### Get Stream with Similar
```http
GET /api/v2/streams/getOneWithSimilar
```

**Query Parameters:**
- `stream_id` (string, required)

#### Get Bookmarks
```http
GET /api/v2/streams/getBookmarks
```

**Authentication:** Required

**Query Parameters:**
- `offset` (integer, default: 0)
- `limit` (integer, default: varies)

#### Get Now Playing
```http
GET /api/v2/streams/getNowPlaying
```

**Query Parameters:**
- `stream_id` (string, required)

#### Get Schedule
```http
GET /api/v2/streams/getSchedule
```

**Query Parameters:**
- `stream_id` (string, required)

#### Get Recent Streams
```http
GET /api/v2/streams/getRecent
```

**Query Parameters:**
- `offset` (integer, default: 0)
- `limit` (integer, default: varies)

### Stream Management

#### Create Stream
```http
POST /api/v2/stream/create
```

**Authentication:** Required

**Request Body (multipart/form-data):**
- `name` (string, required): Stream name
- `info` (string, optional): Stream description
- `tags` (string, optional): Comma-separated tags
- `permalink` (string, optional): Custom permalink
- `category` (integer, optional): Category ID
- `access` (string, optional): "PUBLIC" or "PRIVATE" (default: "PUBLIC")
- `cover` (file, optional): Cover image file

**Response:**
```json
{
  "code": 1,
  "message": "OK",
  "data": {
    "sid": 123,
    "name": "Stream Name",
    ...
  }
}
```

#### Modify Stream
```http
POST /api/v2/stream/modify
```

**Authentication:** Required

**Request Body:**
```json
{
  "stream_id": 123,
  "name": "Updated Name",
  "info": "Updated description",
  "tags": "tag1, tag2",
  "permalink": "new-permalink",
  "category": 1,
  "access": "PUBLIC"
}
```

#### Change Stream Cover
```http
POST /api/v2/stream/changeCover
```

**Authentication:** Required

**Request Body (multipart/form-data):**
- `stream_id` (integer, required)
- `cover` (file, required): Cover image file

#### Remove Stream Cover
```http
POST /api/v2/stream/removeCover
```

**Authentication:** Required

**Request Body:**
```json
{
  "stream_id": 123
}
```

#### Delete Stream
```http
POST /api/v2/stream/delete
```

**Authentication:** Required

**Request Body:**
```json
{
  "stream_id": 123
}
```

### Tracks

#### Upload Track
```http
POST /api/v2/track/upload
```

**Authentication:** Required

**Request Body (multipart/form-data):**
- `stream_id` (integer, optional): Stream ID to add track to
- `up_next` (boolean, optional): Add to queue next (default: false)
- `file` (file, required): Audio file

**Response:**
```json
{
  "code": 1,
  "message": "OK",
  "data": {
    "tracks": [
      {
        "tid": 123,
        "title": "Track Title",
        "artist": "Artist Name",
        "duration": 180,
        ...
      }
    ]
  }
}
```

#### Edit Track
```http
POST /api/v2/track/edit
```

**Authentication:** Required

**Request Body:**
```json
{
  "track_id": 123,
  "title": "New Title",
  "artist": "New Artist"
}
```

#### Delete Track
```http
POST /api/v2/track/delete
```

**Authentication:** Required

**Request Body:**
```json
{
  "track_id": 123
}
```

#### Copy Track
```http
POST /api/v2/track/copy
```

**Authentication:** Required

**Request Body:**
```json
{
  "track_id": 123,
  "stream_id": 456
}
```

#### Change Track Color
```http
POST /api/v2/track/changeColor
```

**Authentication:** Required

**Request Body:**
```json
{
  "track_id": 123,
  "color": "#ff0000"
}
```

#### Preview Track
```http
GET /api/v2/track/preview
```

**Query Parameters:**
- `track_id` (integer, required)

**Response:** Returns audio preview URL

#### Get Track Details
```http
GET /api/v2/tracks/getTrackDetails
```

**Query Parameters:**
- `track_id` (integer, required)

### Stream Control

#### Play Stream
```http
POST /api/v2/control/play
```

**Authentication:** Required

**Request Body:**
```json
{
  "stream_id": 123
}
```

#### Stop Stream
```http
POST /api/v2/control/stop
```

**Authentication:** Required

**Request Body:**
```json
{
  "stream_id": 123
}
```

#### Set Current Track
```http
POST /api/v2/control/setCurrentTrack
```

**Authentication:** Required

**Request Body:**
```json
{
  "stream_id": 123,
  "track_id": 456
}
```

#### Play Next
```http
POST /api/v2/control/playNext
```

**Authentication:** Required

**Request Body:**
```json
{
  "stream_id": 123
}
```

#### Play Previous
```http
POST /api/v2/control/playPrevious
```

**Authentication:** Required

**Request Body:**
```json
{
  "stream_id": 123
}
```

#### Play Random
```http
POST /api/v2/control/playRandom
```

**Authentication:** Required

**Request Body:**
```json
{
  "stream_id": 123
}
```

#### Shuffle
```http
POST /api/v2/control/shuffle
```

**Authentication:** Required

**Request Body:**
```json
{
  "stream_id": 123
}
```

#### Notify
```http
POST /api/v2/control/notify
```

**Authentication:** Required

**Request Body:**
```json
{
  "stream_id": 123,
  "event": "event_name",
  "data": {}
}
```

#### Optimize
```http
POST /api/v2/control/optimize
```

**Authentication:** Required

**Request Body:**
```json
{
  "stream_id": 123
}
```

### Stream Tracks Management

#### Add Tracks to Stream
```http
POST /api/v2/stream/addTracks
```

**Authentication:** Required

**Request Body:**
```json
{
  "stream_id": 123,
  "track_ids": [456, 789]
}
```

#### Remove Tracks from Stream
```http
POST /api/v2/stream/removeTracks
```

**Authentication:** Required

**Request Body:**
```json
{
  "stream_id": 123,
  "track_ids": [456, 789]
}
```

#### Move Track
```http
POST /api/v2/stream/moveTrack
```

**Authentication:** Required

**Request Body:**
```json
{
  "stream_id": 123,
  "track_id": 456,
  "position": 5
}
```

#### Move Tracks to Stream
```http
POST /api/v2/stream/moveTracksToStream
```

**Authentication:** Required

**Request Body:**
```json
{
  "source_stream_id": 123,
  "target_stream_id": 456,
  "track_ids": [789, 101]
}
```

### Bookmarks

#### Add Bookmark
```http
PUT /api/v2/bookmark
```

**Authentication:** Required

**Query Parameters:**
- `stream_id` (string, required)

#### Remove Bookmark
```http
DELETE /api/v2/bookmark
```

**Authentication:** Required

**Query Parameters:**
- `stream_id` (string, required)

### Schedule

#### Get Timeline
```http
GET /api/v2/schedule/timeline
```

**Query Parameters:**
- `stream_id` (string, required)
- `start_time` (integer, optional): Unix timestamp
- `end_time` (integer, optional): Unix timestamp

#### Get Upcoming
```http
GET /api/v2/schedule/upcoming
```

**Query Parameters:**
- `stream_id` (string, required)
- `limit` (integer, optional)

#### Get Schedule for Selected Channels
```http
GET /api/v2/schedule/onSelectedChannels
```

**Query Parameters:**
- `channel_ids` (string, required): Comma-separated channel IDs
- `start_time` (integer, optional): Unix timestamp
- `end_time` (integer, optional): Unix timestamp

### Statistics

#### Get Listeners
```http
GET /api/v2/stats/listeners
```

**Query Parameters:**
- `stream_id` (string, required)

### Categories

#### Get Categories
```http
GET /api/v2/categories
```

**Response:**
```json
{
  "code": 1,
  "message": "OK",
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Category Name",
        "permalink": "category-permalink"
      }
    ]
  }
}
```

### Countries

#### Get Countries
```http
GET /api/v2/countries
```

### Users

#### Get All Users
```http
GET /api/v2/users/getAll
```

**Query Parameters:**
- `offset` (integer, default: 0)
- `limit` (integer, default: varies)

### Collections

#### Get Collection
```http
GET /api/v2/getCollection
```

**Query Parameters:**
- `collection_type` (string, required)
- `collection_id` (string, required)

### Avatar

#### Upload Avatar
```http
POST /api/v2/avatar
```

**Authentication:** Required

**Request Body (multipart/form-data):**
- `avatar` (file, required): Avatar image file

### Self Management

#### Get Self Info
```http
GET /api/v2/self
```

**Authentication:** Required

#### Update Self
```http
POST /api/v2/self
```

**Authentication:** Required

**Request Body:**
```json
{
  "name": "New Name",
  "email": "newemail@example.com"
}
```

#### Change Password
```http
POST /api/v2/self/changePassword
```

**Authentication:** Required

**Request Body:**
```json
{
  "login": "username",
  "password": "current_password",
  "new_password": "new_password",
  "remember": false
}
```

#### Delete Account
```http
POST /api/v2/self/delete
```

**Authentication:** Required

#### Update Options
```http
POST /api/v2/self/options
```

**Authentication:** Required

**Request Body:**
```json
{
  "option_key": "option_value"
}
```

#### Apply Promo Code
```http
POST /api/v2/self/promoCode
```

**Authentication:** Required

**Request Body:**
```json
{
  "code": "promo_code"
}
```

## Error Handling

### Error Response Format

```json
{
  "code": 0,
  "message": "Error message",
  "data": null
}
```

### Common Error Codes

- `0`: General error
- HTTP status codes are also used (400, 401, 404, 500)

### Common Error Messages

- `CEX_NO_USER_BY_LOGIN`: User not found
- `CEX_INCORRECT_LOGIN_OR_PASSWORD`: Invalid credentials
- `CEX_ENTERED_INCORRECT_PASSWORD`: Wrong password
- `CEX_NO_PERMISSION`: Insufficient permissions
- `CEX_MAIN_UN_AUTH_MESSAGE`: Unauthorized access
- `CEX_NO_STREAM`: Stream not found

## Rate Limiting

Rate limiting may be applied to prevent abuse. Check response headers for rate limit information.

## CORS

The API supports CORS with the following headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Headers: *`

## File Uploads

File uploads use `multipart/form-data` encoding. Maximum upload size is configurable (default: 256MB).

Supported audio formats for track uploads:
- MP3
- WAV
- Other formats supported by FFmpeg

Supported image formats for covers/avatars:
- JPEG
- PNG
- GIF

## Notes

- All timestamps are in the server timezone (Europe/Kiev by default)
- Stream/channel IDs can be numeric IDs or permalinks
- User IDs can be numeric IDs or permalinks
- Boolean values in request bodies should be sent as `true`/`false` strings or actual booleans
- The API uses session-based authentication via JWT tokens in cookies
- Some endpoints return different data based on authentication status (e.g., bookmarked status)

