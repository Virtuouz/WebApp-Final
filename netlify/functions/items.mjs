// =============================================================================
// items.mjs — the "backend" for the items table.
//
// This one function handles every CRUD operation. Netlify sends it any request
// to /api/items or /api/items/<id>, and we look at the HTTP method to decide
// what to do:
//
//   GET    /api/items        -> Read all items
//   GET    /api/items/5      -> Read one item
//   POST   /api/items        -> Create an item     (JSON body)
//   PUT    /api/items/5      -> Update an item     (JSON body)
//   DELETE /api/items/5      -> Delete an item
//
// Queries use db.sql`...` (a "tagged template"). Anything inside ${ } is sent
// to the database as a safe parameter, NOT pasted into the SQL text, which
// protects you from SQL injection. Always use ${ } for user-supplied values.
// =============================================================================

import { getDatabase } from "@netlify/database";

const db = getDatabase();

export default async (req) => {
  // Pull the id out of the URL:  /api/items -> undefined,  /api/items/5 -> 5
  // Anything else (like /api/items/abc) is answered with 404 Not Found.
  const { pathname } = new URL(req.url);
  const match = pathname.match(/^\/api\/items(?:\/(\d+))?\/?$/);
  if (!match) return json({ error: "Not found" }, 404);
  const id = match[1] ? Number(match[1]) : undefined;

  try {
    // ---------------- READ ----------------
    if (req.method === "GET" && !id) {
      const items = await db.sql`
        SELECT * FROM items ORDER BY created_at DESC
      `;
      return json(items);
    }

    if (req.method === "GET" && id) {
      const rows = await db.sql`SELECT * FROM items WHERE id = ${id}`;
      if (rows.length === 0) return json({ error: "Item not found" }, 404);
      return json(rows[0]);
    }

    // ---------------- CREATE ----------------
    if (req.method === "POST" && !id) {
      const body = await req.json();
      if (!body.title || !body.title.trim()) {
        return json({ error: "Title is required" }, 400);
      }

      const rows = await db.sql`
        INSERT INTO items (title, notes)
        VALUES (${body.title.trim()}, ${body.notes ?? null})
        RETURNING *
      `;
      return json(rows[0], 201);
    }

    // ---------------- UPDATE ----------------
    if (req.method === "PUT" && id) {
      const body = await req.json();
      if (!body.title || !body.title.trim()) {
        return json({ error: "Title is required" }, 400);
      }

      const rows = await db.sql`
        UPDATE items
        SET title = ${body.title.trim()},
            notes = ${body.notes ?? null},
            done  = ${Boolean(body.done)}
        WHERE id = ${id}
        RETURNING *
      `;
      if (rows.length === 0) return json({ error: "Item not found" }, 404);
      return json(rows[0]);
    }

    // ---------------- DELETE ----------------
    if (req.method === "DELETE" && id) {
      const rows = await db.sql`DELETE FROM items WHERE id = ${id} RETURNING id`;
      if (rows.length === 0) return json({ error: "Item not found" }, 404);
      return json({ deleted: rows[0].id });
    }

    return json({ error: `${req.method} is not supported here` }, 405);
  } catch (err) {
    // Shows up in the terminal running `npm run dev`, or in the
    // Netlify dashboard under Logs > Functions once deployed.
    console.error(err);
    return json({ error: "Something went wrong on the server" }, 500);
  }
};

// Which URLs Netlify sends to this function.
export const config = {
  path: ["/api/items", "/api/items/:id"],
};

// Small helper: turn any JS value into a JSON HTTP response.
function json(data, status = 200) {
  return Response.json(data, { status });
}
