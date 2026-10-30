import { db } from "@/db";
import { resources } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { asString, badRequest } from "@/lib/mitra-api";

export async function GET() {
  const data = await db.select().from(resources).orderBy(desc(resources.createdAt));
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;
  const title = asString(body.title);
  const kind = asString(body.kind);
  const url = asString(body.url);
  const notes = asString(body.notes);

  if (!title) return badRequest("title is required");

  const [created] = await db
    .insert(resources)
    .values({ title, kind: kind || "pdf", url, notes })
    .returning();

  return NextResponse.json({ data: created }, { status: 201 });
}
