# CRUD Starter

A starter project for building a live web app that can **C**reate, **R**ead,
**U**pdate, and **D**elete data.

- **Frontend:** plain HTML, CSS, and JavaScript in `src/`
- **Backend:** a Netlify Function in `netlify/functions/`
- **Database:** Netlify Database (Postgres), set up by a migration in `netlify/database/migrations/`

It already works out of the box: a simple list of "items" you can add, edit,
check off, and delete. Your job is to turn it into your own app.

---

## How the pieces fit together

```
  Browser (src/app.js)
        │   fetch("/api/items", { method: "POST", ... })
        ▼
  Netlify Function (netlify/functions/items.mjs)
        │   db.sql`INSERT INTO items ...`
        ▼
  Netlify Database (Postgres)
```

The browser **never** talks to the database directly. It sends HTTP requests to
your function, and the function runs SQL. This keeps your database private.

| What you do in the app | HTTP request             | SQL it runs |
| ---------------------- | ------------------------ | ----------- |
| Load the list          | `GET /api/items`         | `SELECT`    |
| Add an item            | `POST /api/items`        | `INSERT`    |
| Edit / check off       | `PUT /api/items/5`       | `UPDATE`    |
| Delete                 | `DELETE /api/items/5`    | `DELETE`    |

---

## Project structure

```
crud-starter/
├── netlify/
│   ├── functions/
│   │   └── items.mjs            ← backend: handles /api/items
│   └── database/
│       └── migrations/
│           └── ..._create-items/
│               └── migration.sql   ← creates the items table
├── src/                         ← everything here is your public website
│   ├── index.html
│   ├── app.js
│   └── styles.css
├── netlify.toml                 ← tells Netlify where src/ and functions/ are
├── package.json                 ← dependencies + shortcut commands
├── .gitignore
└── README.md
```

---

## One-time setup

### 1. Install Node.js

You need **Node.js version 22.13 or newer**. Download the LTS version from
<https://nodejs.org>.

Check it worked by opening a terminal and running:

```bash
node -v
```

You should see `v22.13.0` or higher.

### 2. Install the project

In a terminal, go into this project folder and run:

```bash
npm install
```

This downloads everything the project needs, including the Netlify CLI, into a
`node_modules` folder. (You don't need to install Netlify globally.)

### 3. Log in to Netlify

```bash
npm run login
```

A browser window opens. Log in with your Netlify account and authorize the CLI.

---

## Working on your app (every day)

### Start the dev server

```bash
npm run dev
```

Open <http://localhost:8888>. This runs your website, your function, **and a
local database** on your own computer. Nothing you do here affects the live site.

Leave this terminal running. Open a **second terminal** for the commands below.

> **Saved a file but nothing changed?** Refresh the browser. Changes to the
> function reload automatically. If things get weird, stop the server with
> `Ctrl + C` and run `npm run dev` again.

### Set up the local database (first time only)

With the dev server running, in your second terminal:

```bash
npm run db:migrate
```

This creates the `items` table in your local database. You need to do this once,
and again any time you add a new migration.

---

## Database commands

Run these in a second terminal **while `npm run dev` is running**.

| Command | What it does |
| ------- | ------------ |
| `npm run db:migrate` | Apply any new migrations to your local database |
| `npm run db:status` | Show which migrations have been applied |
| `npm run db:query` | Open a SQL prompt to your local database (type `\q` to quit) |
| `npm run db:query -- --query "SELECT * FROM items"` | Run one SQL query and print the result |
| `npm run db:reset` | **Wipe** your local database and start fresh (then run `db:migrate`) |
| `npm run db:new -- "describe the change"` | Create a new, empty migration file |

These commands only affect your **local** database, never the live one.

---

## Changing your database table

Want different columns? Here's the rule:

> **Never edit a migration after it has been deployed.** Make a new one instead.

**Before your first deploy**, you can freely edit the existing
`migration.sql`. Then wipe and rebuild your local database:

```bash
npm run db:reset
npm run db:migrate
```

**After you've deployed**, create a new migration:

```bash
npm run db:new -- "add priority column"
```

That creates a new folder in `netlify/database/migrations/` with an empty
`migration.sql`. Write your SQL in it, for example:

```sql
ALTER TABLE items ADD COLUMN priority INTEGER NOT NULL DEFAULT 0;
```

Then apply it locally:

```bash
npm run db:migrate
```

When you deploy, Netlify applies new migrations to the live database
automatically.

> If you rename the table or add columns, remember to update the SQL in
> `netlify/functions/items.mjs` **and** the form and list in `src/`.

---

## Writing SQL in your function

Queries use `db.sql` with backticks:

```js
const items = await db.sql`SELECT * FROM items WHERE done = ${true}`;
```

Anything inside `${ }` is sent to the database **safely**, as data, not as SQL.
**Always** put user input inside `${ }`. Never build SQL by gluing strings
together like `"SELECT ... WHERE id = " + id`. That's how SQL injection attacks
happen.

`db.sql` always gives you back an **array of rows**, even if there's only one:

```js
const rows = await db.sql`SELECT * FROM items WHERE id = ${id}`;
const item = rows[0]; // undefined if nothing matched
```

Use `RETURNING *` on `INSERT`, `UPDATE`, and `DELETE` to get the changed row back.

---

## Deploying (putting it live on the internet)

### Preview deploy (test it first)

```bash
npm run deploy:preview
```

The first time, the CLI asks you to create a new project or link an existing
one. Choose **create a new project**. When it finishes, it prints a preview URL.

Preview deploys are for checking that things work online. Data you add on a
preview link may not show up on your live site.

### Production deploy (the real, live site)

```bash
npm run deploy:prod
```

This publishes your live URL. On the **first** production deploy, Netlify
creates your live database and runs your migrations automatically.

> ⚠️ **Deploy to production sparingly.** The free Netlify plan comes with a
> monthly budget of credits, and every production deploy uses some of it. Do
> your building and testing with `npm run dev`, check with a preview deploy,
> and only run `deploy:prod` when you have something worth publishing.

### See your live data

In the Netlify dashboard, open your project and go to **Data & Storage →
Database**. You can view and edit the rows in your live database there.

---

## Troubleshooting

**`npm run dev` says a command isn't found / weird errors after install**
Check `node -v` is 22.13 or newer. Then delete the `node_modules` folder and run
`npm install` again.

**`relation "items" does not exist`**
Your local database doesn't have the table yet. Run `npm run db:migrate` (with the
dev server running).

**`db:` commands say no database is running**
Start `npm run dev` first, then run the command in a second terminal.

**The page loads but the list shows an error**
Look at the terminal running `npm run dev`. Server errors are printed there.
Once deployed, find them in the Netlify dashboard under **Logs → Functions**.

**My live site works but has none of my local data**
That's expected. Your local database and your live database are completely
separate.

**I'm getting `Something went wrong on the server`**
That's the function's catch-all error. The real error is in the dev server
terminal (or the Functions log when deployed).

---

## A note on security

This starter has **no login**. Anyone with your site's URL can add, edit, or
delete data. That's fine for a class project, but don't store anything private
or personal in it.
