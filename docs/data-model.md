# QuickNotes Data Model

## Entities and columns

### `users`
| Column | Type | Rules |
|---|---|---|
| `id` | BIGINT | Primary key, generated identity |
| `email` | VARCHAR(254) | Required, unique |
| `display_name` | VARCHAR(100) | Required |
| `password_hash` | TEXT | Required; never store a plain-text password |
| `created_at` | TIMESTAMPTZ | Required, defaults to current time |

### `notes`
| Column | Type | Rules |
|---|---|---|
| `id` | BIGINT | Primary key, generated identity |
| `user_id` | BIGINT | Required foreign key to `users.id` |
| `title` | VARCHAR(100) | Required |
| `body` | TEXT | Optional |
| `created_at` | TIMESTAMPTZ | Required, defaults to current time |
| `updated_at` | TIMESTAMPTZ | Required, defaults to current time |

### `tags`
| Column | Type | Rules |
|---|---|---|
| `id` | BIGINT | Primary key, generated identity |
| `user_id` | BIGINT | Required foreign key to `users.id` |
| `name` | VARCHAR(50) | Required |

### `note_tags`
| Column | Type | Rules |
|---|---|---|
| `note_id` | BIGINT | Primary key component and foreign key to `notes.id` |
| `tag_id` | BIGINT | Primary key component and foreign key to `tags.id` |
| `created_at` | TIMESTAMPTZ | Required, defaults to current time |

## Relationships
- One user can own many notes: `users.id` → `notes.user_id` (one-to-many).
- One user can own many tags: `users.id` → `tags.user_id` (one-to-many).
- One note can have many tags, and one tag can be applied to many notes. `note_tags` implements this many-to-many relationship.

## SQL schema

```sql
CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(254) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    body TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    UNIQUE (user_id, name)
);

CREATE TABLE note_tags (
    note_id BIGINT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (note_id, tag_id)
);

CREATE INDEX idx_notes_user_created ON notes(user_id, created_at DESC);
```

The index on `(user_id, created_at DESC)` helps list one user's newest notes. The primary key on `note_tags` also indexes its key columns.

## Example SQL queries

### 1. Get a user's newest notes

```sql
SELECT id, title, body, created_at
FROM notes
WHERE user_id = 27
ORDER BY created_at DESC
LIMIT 20;
```

### 2. Get notes with tag names (JOIN)

```sql
SELECT n.id, n.title, t.name AS tag_name
FROM notes AS n
JOIN note_tags AS nt ON nt.note_id = n.id
JOIN tags AS t ON t.id = nt.tag_id
WHERE n.user_id = 27
ORDER BY n.created_at DESC;
```

### 3. Count notes per user

```sql
SELECT u.id, u.display_name, COUNT(n.id) AS note_count
FROM users AS u
LEFT JOIN notes AS n ON n.user_id = u.id
GROUP BY u.id, u.display_name
ORDER BY note_count DESC;
```

## SQL or NoSQL?
I would choose a relational SQL database such as PostgreSQL for the first production version. Users, notes, tags and the join table have clear relationships, and foreign keys help preserve data integrity. Transactions also make related changes safer. A document database could be useful if note data later becomes highly variable, but it would add complexity without a clear benefit for this initial model.
