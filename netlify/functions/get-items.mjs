// READ: sends back every item in the database.
// The browser calls this at /api/get-items

import { getDatabase } from "@netlify/database";

const db = getDatabase();

export default async function handler(req) {
  const items = await db.sql`SELECT * FROM items ORDER BY id`;
  return Response.json(items);
}

export const config = { path: "/api/get-items" };
