# CRUD Starter

A simple website that can **C**reate, **R**ead, **U**pdate, and **D**elete items
saved in a real database. Your job is to turn it into your own app.

---

## What's in this project

```
src/                     ← your website (HTML, CSS, JavaScript)
  index.html
  styles.css
  app.js

netlify/functions/       ← your "backend" (talks to the database)
  get-items.mjs          ← READ   all items
  add-item.mjs           ← CREATE an item
  update-item.mjs        ← UPDATE an item
  delete-item.mjs        ← DELETE an item

netlify/database/migrations/
  .../migration.sql      ← creates the "items" table in the database
```

**How it works:** when you click a button, `app.js` uses `fetch()` to send a
message to one of the functions. The function runs some SQL on the database
and sends an answer back. The browser never talks to the database directly.

```
app.js  ──fetch("/api/add-item")──▶  add-item.mjs  ──INSERT──▶  database
```

---

## Setup (do this once)

1. Install **Node.js** (version 22.13 or newer) from <https://nodejs.org>.
2. Open a terminal in this project folder and run:

   ```bash
   npm install
   ```

3. Log in to Netlify:

   ```bash
   npm run login
   ```

---

## Running it on your computer

1. Start the website:

   ```bash
   npm run dev
   ```

   Then open <http://localhost:8888>. Leave this terminal running.

2. **First time only:** open a **second terminal** and create the database table:

   ```bash
   npm run db:migrate
   ```

3. Refresh the page. You should be able to add, edit, and delete items!

If you save a file and don't see the change, refresh the browser.

---

## Putting it on the internet

Test it with a preview link first:

```bash
npm run deploy:preview
```

The first time, choose **create a new project**. It will print a link you can open.

When you're happy with it, publish the real site:

```bash
npm run deploy:prod
```

> ⚠️ Don't run `deploy:prod` too often. The free Netlify plan has a monthly limit.
> Do your testing with `npm run dev` instead.

Your live site has its **own** database, separate from the one on your computer.
You can see the live data in the Netlify dashboard under
**Data & Storage → Database**.

---

## Making it your own

### Changing the look

Edit `src/index.html` and `src/styles.css` like any other website.

### Adding a new column (example: a "price" for each item)

You need to change **four** places:

**1. The database table.** In `migration.sql`, add the new column:

```sql
CREATE TABLE items (
  id    SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  price TEXT
);
```

Then rebuild your local database (with `npm run dev` running):

```bash
npm run db:reset
npm run db:migrate
```

**2. The HTML.** Add another input box in `index.html`:

```html
<input type="text" id="price-input" placeholder="Price">
```

**3. The JavaScript.** In `addItem()` in `app.js`, read the new box and send it:

```js
const price = document.getElementById("price-input").value;

await fetch("/api/add-item", {
  method: "POST",
  body: JSON.stringify({ title: title, price: price }),
});
```

And show it in `loadItems()`:

```js
<span>${item.title} - $${item.price}</span>
```

**4. The function.** In `add-item.mjs`, save the new value:

```js
await db.sql`INSERT INTO items (title, price) VALUES (${data.title}, ${data.price})`;
```

### ⚠️ Already deployed to production?

Once your site is live, **don't edit the old `migration.sql` anymore**. Make a
new migration instead:

```bash
npm run db:new -- "add price column"
```

This creates a new `migration.sql` file in a new folder. Put your change in it:

```sql
ALTER TABLE items ADD COLUMN price TEXT;
```

Then run `npm run db:migrate`. Netlify will apply it to your live database the
next time you deploy.

---

## A quick SQL cheat sheet

In the functions, SQL goes inside `` db.sql`...` ``. Always put values from the
user inside `${ }`, which keeps your database safe.

| What you want          | SQL                                                  |
| ---------------------- | ---------------------------------------------------- |
| Get all items          | `SELECT * FROM items`                                |
| Add an item            | `INSERT INTO items (title) VALUES (${data.title})`   |
| Change an item         | `UPDATE items SET title = ${data.title} WHERE id = ${data.id}` |
| Delete an item         | `DELETE FROM items WHERE id = ${data.id}`            |

---

## Something's not working?

- **The list is empty and adding does nothing:** did you run `npm run db:migrate`?
- **An error says `relation "items" does not exist`:** same thing, run `npm run db:migrate`.
- **Something is broken:** look at the terminal running `npm run dev`. Errors are
  printed there. You can also open the browser console (F12 → Console).
- **Weird errors after installing:** check `node -v` is 22.13 or newer, delete the
  `node_modules` folder, and run `npm install` again.
- **My live site doesn't have my local items:** that's normal, they're separate databases.

---

## Note

There's no login, so anyone with your link can change your data. Don't store
anything private in it.
