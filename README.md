# QuickNotes System Design

QuickNotes is a learning project that combines a small browser-based notes client with REST API design, relational data modelling and scalable system architecture documentation.

## Project files
- `index.html` — accessible page structure and form.
- `style.css` — responsive presentation and status styling.
- `api.js` — asynchronous GET, POST and DELETE requests using `fetch`.
- [`docs/api-design.md`](docs/api-design.md) — REST endpoints, examples and errors.
- [`docs/data-model.md`](docs/data-model.md) — relational schema, relationships, SQL and queries.
- [`docs/architecture.md`](docs/architecture.md) — requirements, capacity estimate and architecture.

## Run the API client
1. Download or clone this repository.
2. Open `index.html` in a modern browser. If your browser blocks requests from a local file, run a simple local static server or use VS Code Live Server.
3. Select **Load notes** to request up to 10 demo posts.
4. Use the form to create a note and the **Delete** button to remove a note from the current demo view.

The client uses the public JSONPlaceholder demo API at `https://jsonplaceholder.typicode.com/posts`. It is intended for practice: POST and DELETE responses are simulated and changes do not persist on the service. A production app would use a real authenticated API and database.

## What I learned
- How asynchronous `fetch` works and why checking `response.ok` matters.
- How loading, success, empty and error states make network-dependent interfaces easier to understand.
- How REST endpoints and HTTP status codes communicate API behavior.
- How primary keys, foreign keys, indexes and join tables represent relational relationships.
- How caches, read replicas, load balancers and queues improve scalability while introducing trade-offs.

## Quality checklist
- Titles are required and limited to 100 characters in the browser client.
- User-provided note text is rendered with `textContent`, not injected as HTML.
- Buttons are disabled during requests to reduce duplicate actions.
- The architecture document labels traffic and storage figures as estimates.
