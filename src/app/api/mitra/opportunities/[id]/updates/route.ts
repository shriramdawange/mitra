import { db } from "@/db";
import { opportunities, opportunityUpdates } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { asString, badRequest } from "@/lib/mitra-api";
import { todayDateString } from "@/lib/dates";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const opportunityId = Number(id);

  if (!Number.isFinite(opportunityId) || opportunityId <= 0) {
    return badRequest("invalid opportunity id");
  }

  const data = await db
    .select()
    .from(opportunityUpdates)
    .where(eq(opportunityUpdates.opportunityId, opportunityId))
    .orderBy(desc(opportunityUpdates.createdAt))
    .limit(20);

  return NextResponse.json({ data });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const opportunityId = Number(id);

  if (!Number.isFinite(opportunityId) || opportunityId <= 0) {
    return badRequest("invalid opportunity id");
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  let field = asString(body.field);

  if (!field) {
    const existing = await db
      .select({ field: opportunities.field })
      .from(opportunities)
      .where(eq(opportunities.id, opportunityId))
      .limit(1);
    field = existing[0]?.field ?? "technology";
  }

  const response = await fetch(
    `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(field)}&tags=story&hitsPerPage=5`,
    { next: { revalidate: 0 } },
  );

  if (!response.ok) {
    return NextResponse.json({ error: "failed to fetch updates" }, { status: 502 });
  }

  const json = (await response.json()) as {
    hits?: Array<{ title?: string; url?: string; story_text?: string }>;
  };

  const items = (json.hits ?? [])
    .map((hit) => ({
      opportunityId,
      headline: (hit.title ?? "Untitled update").slice(0, 250),
      url: hit.url ?? "",
      summary: (hit.story_text ?? "Latest field-related update").slice(0, 400),
      updateDate: todayDateString(),
    }))
    .slice(0, 5);

  if (items.length > 0) {
    await db.insert(opportunityUpdates).values(items);
    await db.update(opportunities).set({ updatedAt: new Date() }).where(eq(opportunities.id, opportunityId));
  }

  const data = await db
    .select()
    .from(opportunityUpdates)
    .where(eq(opportunityUpdates.opportunityId, opportunityId))
    .orderBy(desc(opportunityUpdates.createdAt))
    .limit(20);

  return NextResponse.json({ data });
}
