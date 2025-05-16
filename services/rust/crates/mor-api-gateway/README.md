# Channel API

This API provides CRUD operations for managing user channels.

## Base URL

```
/users/{userId}/channels
```

---

## Endpoints

### `GET /users/{userId}/channels`

**Description:** List all channels for a given user.

**Response:**  
Returns a JSON array of channels.

---

### `POST /users/{userId}/channels`

**Description:** Create a new channel for a given user.

**Request Body:**

```json
{
  "name": "My Channel",
  "permalink": "my-channel",
  "info": "Channel info",
  "jingle_interval": 30,
  "status": 1,
  "started": 1680000000,
  "started_from": 1680000000,
  "access": "public",
  "category": 5,
  "hashtags": "#music,#news",
  "cover": "cover.jpg",
  "cover_background": "bg.jpg",
  "created": 1680000000,
  "rtmp_url": "rtmp://example.com/live",
  "rtmp_streaming_key": "abc123"
}
```

**Response:**  
Returns the newly created channel object as JSON.

---

### `GET /users/{userId}/channels/{channelId}`

**Description:** Retrieve a specific channel by its ID and user ID.

**Response:**  
Returns a channel object as JSON.

---

### `PUT /users/{userId}/channels/{channelId}`

**Description:** Update a specific channel by its ID and user ID.

**Request Body:**  
Same as in the POST request above.

**Response:**  
Returns the updated channel object as JSON.

---

### `DELETE /users/{userId}/channels/{channelId}`

**Description:** Delete a specific channel by its ID and user ID.

**Response:**  
Returns status `202 Accepted` on successful deletion.  
Returns status `404 Not Found` if the channel doesn't exist.