// DELETE: removes one item from the database.
// The browser calls this at /api/delete-item and sends { id: 5 }

import { getDatabase } from "@netlify/database";

const db = getDatabase();

export default async function handler(req) {
  const data = await req.json();

  await db.sql`DELETE FROM items WHERE id = ${data.id}`;

  return Response.json({ message: "Item deleted" });
}

export const config = { path: "/api/delete-item" };
