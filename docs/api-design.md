# QuickNotes API Design

## Overview
The API uses REST-style resources. The examples describe the intended production API. The browser demo in `api.js` uses JSONPlaceholder (`https://jsonplaceholder.typicode.com/posts`) to practice GET, POST and DELETE. JSONPlaceholder simulates writes; it does not permanently save them.

Base path for the proposed production API: `/api/v1`

## Endpoints

| Method | Path | Description | Success status |
|---|---|---|---:|
| GET | `/api/v1/notes` | List the signed-in user's notes; supports `page` and `limit` | 200 OK |
| GET | `/api/v1/notes/{noteId}` | Retrieve one note by ID | 200 OK |
| POST | `/api/v1/notes` | Create a note | 201 Created |
| PATCH | `/api/v1/notes/{noteId}` | Update selected fields of a note | 200 OK |
| DELETE | `/api/v1/notes/{noteId}` | Delete a note | 204 No Content |
| GET | `/api/v1/tags` | List tags available to the signed-in user | 200 OK |
| POST | `/api/v1/notes/{noteId}/tags` | Attach an existing tag to a note | 201 Created |

All endpoints require HTTPS. Authenticated endpoints use a bearer access token. The server must check ownership so a user cannot access another user's notes.

## Create a note

Request:

```http
POST /api/v1/notes
Authorization: Bearer <access-token>
Content-Type: application/json
```

```json
{
  "title": "Plan the week",
  "body": "Review priorities and schedule study time.",
  "tagIds": [2, 4]
}
```

Response (`201 Created`):

```json
{
  "id": 481,
  "userId": 27,
  "title": "Plan the week",
  "body": "Review priorities and schedule study time.",
  "createdAt": "2026-10-29T08:30:00Z",
  "updatedAt": "2026-10-29T08:30:00Z",
  "tags": [{"id": 2, "name": "Planning"}, {"id": 4, "name": "Study"}]
}
```

## List notes

Request:

```http
GET /api/v1/notes?page=1&limit=10
Authorization: Bearer <access-token>
```

Response (`200 OK`):

```json
{
  "data": [
    {
      "id": 481,
      "userId": 27,
      "title": "Plan the week",
      "body": "Review priorities and schedule study time.",
      "createdAt": "2026-10-29T08:30:00Z",
      "updatedAt": "2026-10-29T08:30:00Z"
    }
  ],
  "pagination": {"page": 1, "limit": 10, "totalItems": 1, "totalPages": 1}
}
```

## Error responses

| HTTP status | Meaning | Typical cause |
|---:|---|---|
| 400 | Bad Request | Missing title or invalid field format |
| 401 | Unauthorized | Missing, expired or invalid access token |
| 403 | Forbidden | Authenticated user lacks permission |
| 404 | Not Found | Note or tag does not exist or is not visible |
| 500 | Internal Server Error | Unexpected server-side failure |

Example error body:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The title field is required.",
    "details": [{"field": "title", "issue": "required"}],
    "requestId": "req_abc123"
  }
}
```

## Design notes
- Use consistent JSON responses and meaningful HTTP status codes.
- Validate input on the server even when the browser also validates it.
- Use pagination to avoid returning an unbounded list.
- Never expose stack traces or secrets in client-facing error messages.


## Validation, security and pagination rules

### Note validation
- `title` is required, must not be blank after trimming whitespace, and must contain no more than 100 characters.
- `body` is optional and should have a documented maximum length enforced by the server.
- `tagIds`, when supplied, must contain valid tag IDs belonging to the authenticated user.
- Invalid input returns `400 Bad Request` with a structured error response.

### Authentication and authorization
- Protected endpoints require a valid bearer access token.
- Missing or invalid authentication returns `401 Unauthorized`.
- An authenticated user attempting an operation they are not permitted to perform receives `403 Forbidden`, where appropriate.
- Users must only access notes and tags they own. The server must enforce ownership on every read, update and delete operation.
- All API traffic must use HTTPS.

### Pagination rules
- `page` is a positive integer, starting at `1`.
- `limit` is a positive integer with a default of `10` and a maximum of `100`.
- Invalid pagination parameters return `400 Bad Request`.
- The response includes pagination metadata so clients can determine whether more results are available.

### Consistent error handling
Every error response should include a stable error code and a readable message. Validation errors may include field-level details. Responses must not expose passwords, access tokens, database credentials or internal stack traces.
