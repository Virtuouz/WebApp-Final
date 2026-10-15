// CREATE: adds a new item to the database.
// The browser calls this at /api/add-item and sends { title: "..." }

import { getDatabase } from "@netlify/database";

const db = getDatabase();

export default async function handler(req) {
  const data = await req.json();

  await db.sql`INSERT INTO items (title) VALUES (${data.title})`;

  return Response.json({ message: "Item added" });
}

export const config = { path: "/api/add-item" };
