import { db } from "@/db";
import { goalLogs } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { asBoolean, asNumber, asString, badRequest } from "@/lib/mitra-api";
import { todayDateString } from "@/lib/dates";

export async function GET() {
  const data = await db.select().from(goalLogs).orderBy(desc(goalLogs.createdAt));
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;
  const goalId = asNumber(body.goalId);
  const note = asString(body.note);
  const completedToday = asBoolean(body.completedToday);

  if (!goalId) return badRequest("goalId is required");

  const [created] = await db
    .insert(goalLogs)
    .values({
      goalId,
      note,
      completedToday,
      logDate: todayDateString(),
    })
    .returning();

  return NextResponse.json({ data: created }, { status: 201 });
}
