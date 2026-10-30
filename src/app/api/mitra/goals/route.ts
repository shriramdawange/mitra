import { db } from "@/db";
import { goals } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { asBoolean, asNumber, asString, badRequest } from "@/lib/mitra-api";

export async function GET() {
  const data = await db.select().from(goals).orderBy(desc(goals.createdAt));
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;
  const title = asString(body.title);
  const description = asString(body.description);
  const targetDate = asString(body.targetDate);

  if (!title) return badRequest("title is required");

  const [created] = await db
    .insert(goals)
    .values({ title, description, targetDate: targetDate || null })
    .returning();

  return NextResponse.json({ data: created }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;
  const id = asNumber(body.id);
  const completed = asBoolean(body.completed);

  if (!id) return badRequest("id is required");

  const [updated] = await db
    .update(goals)
    .set({ completed })
    .where(eq(goals.id, id))
    .returning();

  return NextResponse.json({ data: updated });
}
