import { db } from "@/db";
import { reminders } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { asBoolean, asNumber, asString, badRequest } from "@/lib/mitra-api";

export async function GET() {
  const data = await db.select().from(reminders).orderBy(desc(reminders.remindAt));
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;
  const title = asString(body.title);
  const details = asString(body.details);
  const remindAt = asString(body.remindAt);

  if (!title || !remindAt) return badRequest("title and remindAt are required");

  const [created] = await db
    .insert(reminders)
    .values({ title, details, remindAt: new Date(remindAt) })
    .returning();

  return NextResponse.json({ data: created }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;
  const id = asNumber(body.id);
  const done = asBoolean(body.done);

  if (!id) return badRequest("id is required");

  const [updated] = await db.update(reminders).set({ done }).where(eq(reminders.id, id)).returning();
  return NextResponse.json({ data: updated });
}
