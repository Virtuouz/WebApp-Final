// app.js runs in the browser.
//
// The browser can't talk to the database directly. Instead, it uses fetch()
// to send a message to one of our Netlify Functions (in netlify/functions/),
// and the function talks to the database.
//
// "async" and "await" are needed whenever we talk to the server.
// "await" just means: wait for the server to answer before moving on.


// READ: get all the items from the server and show them on the page
async function loadItems() {
  const response = await fetch("/api/get-items");
  const items = await response.json();

  const list = document.getElementById("item-list");
  list.innerHTML = "";

  for (const item of items) {
    list.innerHTML += `
      <li>
        <span>${item.title}</span>
        <button onclick="editItem(${item.id})">Edit</button>
        <button onclick="deleteItem(${item.id})">Delete</button>
      </li>
    `;
  }
}


// CREATE: add a new item using the text in the input box
async function addItem() {
  const input = document.getElementById("title-input");
  const title = input.value;

  if (title === "") {
    alert("Please type something first!");
    return;
  }

  await fetch("/api/add-item", {
    method: "POST",
    body: JSON.stringify({ title: title }),
  });

  input.value = "";
  loadItems();
}


// UPDATE: ask for a new title, then save it
async function editItem(id) {
  const newTitle = prompt("Enter the new title:");

  if (newTitle === null || newTitle === "") {
    return;
  }

  await fetch("/api/update-item", {
    method: "POST",
    body: JSON.stringify({ id: id, title: newTitle }),
  });

  loadItems();
}


// DELETE: remove an item
async function deleteItem(id) {
  if (!confirm("Are you sure you want to delete this?")) {
    return;
  }

  await fetch("/api/delete-item", {
    method: "POST",
    body: JSON.stringify({ id: id }),
  });

  loadItems();
}


// Show the items as soon as the page opens
loadItems();
