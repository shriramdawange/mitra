import { db } from "@/db";
import { todos } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { asBoolean, asNumber, asString, badRequest } from "@/lib/mitra-api";

export async function GET() {
  const data = await db.select().from(todos).orderBy(desc(todos.createdAt));
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;
  const title = asString(body.title);
  const dueDate = asString(body.dueDate);
  const priority = asString(body.priority);

  if (!title) return badRequest("title is required");

  const [created] = await db
    .insert(todos)
    .values({ title, dueDate: dueDate || null, priority: priority || "medium" })
    .returning();

  return NextResponse.json({ data: created }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;
  const id = asNumber(body.id);
  const done = asBoolean(body.done);

  if (!id) return badRequest("id is required");

  const [updated] = await db.update(todos).set({ done }).where(eq(todos.id, id)).returning();
  return NextResponse.json({ data: updated });
}
