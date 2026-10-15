// UPDATE: changes the title of one item.
// The browser calls this at /api/update-item and sends { id: 5, title: "..." }

import { getDatabase } from "@netlify/database";

const db = getDatabase();

export default async function handler(req) {
  const data = await req.json();

  await db.sql`UPDATE items SET title = ${data.title} WHERE id = ${data.id}`;

  return Response.json({ message: "Item updated" });
}

export const config = { path: "/api/update-item" };
