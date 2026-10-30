import { db } from "@/db";
import { developmentLogs } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { asString, badRequest } from "@/lib/mitra-api";
import { todayDateString } from "@/lib/dates";

export async function GET() {
  const data = await db.select().from(developmentLogs).orderBy(desc(developmentLogs.createdAt));
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;
  const focusArea = asString(body.focusArea);
  const reflection = asString(body.reflection);
  const mood = asString(body.mood);
  const logDate = asString(body.logDate);

  if (!focusArea || !reflection) return badRequest("focusArea and reflection are required");

  const [created] = await db
    .insert(developmentLogs)
    .values({
      focusArea,
      reflection,
      mood: mood || "neutral",
      logDate: logDate || todayDateString(),
    })
    .returning();

  return NextResponse.json({ data: created }, { status: 201 });
}
