import { db } from "@/db";
import { learningItems } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { asString, badRequest } from "@/lib/mitra-api";

export async function GET() {
  const data = await db.select().from(learningItems).orderBy(desc(learningItems.createdAt));
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;
  const title = asString(body.title);
  const topic = asString(body.topic);
  const status = asString(body.status);
  const resourceUrl = asString(body.resourceUrl);
  const notes = asString(body.notes);

  if (!title) return badRequest("title is required");

  const [created] = await db
    .insert(learningItems)
    .values({
      title,
      topic: topic || "General",
      status: status || "planned",
      resourceUrl,
      notes,
    })
    .returning();

  return NextResponse.json({ data: created }, { status: 201 });
}
