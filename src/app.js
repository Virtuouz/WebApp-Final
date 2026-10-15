// =============================================================================
// app.js — the frontend. Runs in the browser.
//
// The browser NEVER talks to the database directly. It sends HTTP requests
// with fetch() to our function at /api/items, and the function talks to the
// database. That keeps the database private and safe.
// =============================================================================

const API = "/api/items";

// Grab the elements we need from index.html
const form = document.getElementById("item-form");
const idInput = document.getElementById("item-id");
const titleInput = document.getElementById("title");
const notesInput = document.getElementById("notes");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");
const list = document.getElementById("item-list");
const message = document.getElementById("message");

// -----------------------------------------------------------------------------
// API calls — one small function per CRUD operation
// -----------------------------------------------------------------------------

async function getItems() {
  const res = await fetch(API);
  return handle(res);
}

async function createItem(item) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  return handle(res);
}

async function updateItem(id, item) {
  const res = await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  return handle(res);
}

async function deleteItem(id) {
  const res = await fetch(`${API}/${id}`, { method: "DELETE" });
  return handle(res);
}

// Turns a fetch Response into data, or throws with the server's error message
async function handle(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// -----------------------------------------------------------------------------
// Rendering — draw the list on the page
// -----------------------------------------------------------------------------

async function render() {
  try {
    const items = await getItems();
    list.replaceChildren(); // clear the old list

    if (items.length === 0) {
      const empty = document.createElement("li");
      empty.className = "empty";
      empty.textContent = "No items yet. Add one above.";
      list.append(empty);
      return;
    }

    for (const item of items) {
      list.append(renderItem(item));
    }
  } catch (err) {
    showMessage(err.message, true);
  }
}

function renderItem(item) {
  const li = document.createElement("li");
  if (item.done) li.classList.add("done");

  // Checkbox toggles "done" (an Update)
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = item.done;
  checkbox.addEventListener("change", async () => {
    await run(() => updateItem(item.id, { ...item, done: checkbox.checked }));
  });

  // Use textContent (not innerHTML) so user text can't inject HTML
  const text = document.createElement("div");
  text.className = "text";
  const title = document.createElement("strong");
  title.textContent = item.title;
  text.append(title);
  if (item.notes) {
    const notes = document.createElement("p");
    notes.textContent = item.notes;
    text.append(notes);
  }

  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.addEventListener("click", () => startEditing(item));

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.className = "danger";
  deleteBtn.addEventListener("click", async () => {
    if (confirm(`Delete "${item.title}"?`)) {
      await run(() => deleteItem(item.id));
    }
  });

  li.append(checkbox, text, editBtn, deleteBtn);
  return li;
}

// -----------------------------------------------------------------------------
// Form handling — Create or Update depending on whether we're editing
// -----------------------------------------------------------------------------

form.addEventListener("submit", async (event) => {
  event.preventDefault(); // stop the page from reloading

  const item = {
    title: titleInput.value,
    notes: notesInput.value,
  };

  const id = idInput.value;
  let ok;
  if (id) {
    const existing = JSON.parse(form.dataset.editing);
    ok = await run(() => updateItem(id, { ...existing, ...item }));
  } else {
    ok = await run(() => createItem(item));
  }
  if (ok) resetForm(); // keep what they typed if something went wrong
});

cancelBtn.addEventListener("click", resetForm);

function startEditing(item) {
  idInput.value = item.id;
  titleInput.value = item.title;
  notesInput.value = item.notes ?? "";
  form.dataset.editing = JSON.stringify(item);
  submitBtn.textContent = "Save changes";
  cancelBtn.hidden = false;
  titleInput.focus();
}

function resetForm() {
  form.reset();
  idInput.value = "";
  delete form.dataset.editing;
  submitBtn.textContent = "Add item";
  cancelBtn.hidden = true;
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

// Run an API action, then refresh the list. Shows errors on the page.
// Returns true if it worked, false if it failed.
async function run(action) {
  try {
    await action();
    showMessage("");
    await render();
    return true;
  } catch (err) {
    showMessage(err.message, true);
    return false;
  }
}

function showMessage(text, isError = false) {
  message.textContent = text;
  message.className = isError ? "error" : "";
}

// Load the list when the page opens
render();
