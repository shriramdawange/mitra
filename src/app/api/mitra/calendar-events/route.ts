import { db } from "@/db";
import { calendarEvents } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { asString, badRequest } from "@/lib/mitra-api";

export async function GET() {
  const data = await db.select().from(calendarEvents).orderBy(desc(calendarEvents.eventDate));
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;
  const title = asString(body.title);
  const eventDate = asString(body.eventDate);
  const notes = asString(body.notes);
  const startTime = asString(body.startTime);
  const endTime = asString(body.endTime);

  if (!title || !eventDate) return badRequest("title and eventDate are required");

  const [created] = await db
    .insert(calendarEvents)
    .values({
      title,
      eventDate,
      notes,
      startTime: startTime || null,
      endTime: endTime || null,
    })
    .returning();

  return NextResponse.json({ data: created }, { status: 201 });
}
