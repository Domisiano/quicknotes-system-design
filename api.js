// QuickNotes demo API client. JSONPlaceholder simulates writes; they do not persist.
const API_URL = "https://jsonplaceholder.typicode.com/posts";
const loadButton = document.querySelector("#load-btn");
const noteForm = document.querySelector("#note-form");
const titleInput = document.querySelector("#title-input");
const bodyInput = document.querySelector("#body-input");
const submitButton = document.querySelector("#submit-btn");
const statusElement = document.querySelector("#status");
const notesList = document.querySelector("#notes-list");
let notes = [];

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  if (!response.ok) throw new Error(`Request failed with HTTP ${response.status}`);
  if (response.status === 204) return null;
  return response.json();
}
function setStatus(message, type = "") {
  statusElement.textContent = message;
  statusElement.className = type ? `status ${type}` : "status";
}
function setBusy(isBusy) {
  loadButton.disabled = isBusy;
  submitButton.disabled = isBusy;
  notesList.querySelectorAll("button").forEach((button) => { button.disabled = isBusy; });
}
function renderNotes() {
  notesList.replaceChildren();
  if (notes.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "empty-state";
    emptyItem.textContent = "No notes to display yet. Load notes or create one.";
    notesList.append(emptyItem);
    return;
  }
  notes.forEach((note) => {
    const item = document.createElement("li"); item.className = "note-card";
    const title = document.createElement("h3"); title.textContent = note.title || "Untitled note";
    const body = document.createElement("p"); body.textContent = note.body || "No note text provided.";
    const actions = document.createElement("div"); actions.className = "note-actions";
    const noteId = document.createElement("span"); noteId.className = "note-id"; noteId.textContent = `Note ID: ${note.id}`;
    const deleteButton = document.createElement("button"); deleteButton.type = "button"; deleteButton.className = "delete-btn"; deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteNote(note.id));
    actions.append(noteId, deleteButton); item.append(title, body, actions); notesList.append(item);
  });
}
async function loadNotes() {
  setBusy(true); setStatus("Loading notes...");
  try {
    const result = await request(`${API_URL}?_limit=10`);
    notes = result.map((item) => ({ id: item.id, title: item.title, body: item.body }));
    renderNotes();
    setStatus(notes.length ? `Loaded ${notes.length} notes successfully.` : "No notes were found.", "success");
  } catch (error) {
    setStatus(`Could not load notes: ${error.message}. Check your connection and try again.`, "error");
  } finally { setBusy(false); }
}
async function createNote(title, body) {
  setBusy(true); setStatus("Saving note...");
  try {
    const created = await request(API_URL, { method: "POST", body: JSON.stringify({ title, body, userId: 1 }) });
    notes = [{ id: created.id, title: created.title, body: created.body }, ...notes];
    renderNotes(); noteForm.reset();
    setStatus("Note created successfully. Note: this demo API does not permanently store new notes.", "success");
  } catch (error) {
    setStatus(`Could not save note: ${error.message}. Please try again.`, "error");
  } finally { setBusy(false); }
}
async function deleteNote(id) {
  setBusy(true); setStatus("Deleting note...");
  try {
    await request(`${API_URL}/${encodeURIComponent(id)}`, { method: "DELETE" });
    notes = notes.filter((note) => note.id !== id); renderNotes();
    setStatus("Note deleted from this demo view. The demo API does not permanently store changes.", "success");
  } catch (error) {
    setStatus(`Could not delete note: ${error.message}. Please try again.`, "error");
  } finally { setBusy(false); }
}
loadButton.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = titleInput.value.trim(); const body = bodyInput.value.trim();
  if (!title) { setStatus("Please enter a title before saving.", "error"); titleInput.focus(); return; }
  if (title.length > 100) { setStatus("The title must be 100 characters or fewer.", "error"); titleInput.focus(); return; }
  createNote(title, body);
});
renderNotes();
