import { db } from "@/db";
import { habitLogs } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { todayDateString } from "@/lib/dates";

/**
 * Idempotent daily check-in: inserts a habit log for today only if one doesn't exist yet.
 * Returns true when the check-in was recorded, false when it was already done.
 */
export async function checkHabitToday(habitId: number, logDate: string = todayDateString()) {
  const existing = await db
    .select({ id: habitLogs.id })
    .from(habitLogs)
    .where(and(eq(habitLogs.habitId, habitId), eq(habitLogs.logDate, logDate)))
    .limit(1);

  if (existing.length > 0) {
    return false;
  }

  await db.insert(habitLogs).values({ habitId, logDate, completed: true });
  return true;
}
