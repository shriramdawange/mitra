import { db } from "@/db";
import { habitLogs, habits } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { checkHabitToday } from "@/lib/operations";
import { asNumber, asString, badRequest } from "@/lib/mitra-api";

export async function GET() {
  const data = await db.select().from(habits).orderBy(desc(habits.createdAt));
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;
  const name = asString(body.name);
  const category = asString(body.category);

  if (!name) return badRequest("name is required");

  const [created] = await db
    .insert(habits)
    .values({ name, category: category || "General" })
    .returning();

  return NextResponse.json({ data: created }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const habitId = asNumber(body.habitId);

  if (!habitId) return badRequest("habitId is required");

  const completed = await checkHabitToday(habitId);

  return NextResponse.json({ ok: true, completed });
}
