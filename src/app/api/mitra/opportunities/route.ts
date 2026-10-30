import { db } from "@/db";
import { opportunities } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { asString, badRequest } from "@/lib/mitra-api";

export async function GET() {
  const data = await db.select().from(opportunities).orderBy(desc(opportunities.updatedAt));
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;
  const field = asString(body.field);
  const title = asString(body.title);
  const location = asString(body.location);
  const sourceUrl = asString(body.sourceUrl);
  const details = asString(body.details);

  if (!field || !title) return badRequest("field and title are required");

  const [created] = await db
    .insert(opportunities)
    .values({
      field,
      title,
      location: location || "Remote",
      sourceUrl,
      details,
      updatedAt: new Date(),
    })
    .returning();

  return NextResponse.json({ data: created }, { status: 201 });
}
