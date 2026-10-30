"use server";

import { db } from "@/db";
import {
  calendarEvents,
  developmentLogs,
  goalLogs,
  goals,
  habits,
  learningItems,
  opportunities,
  opportunityUpdates,
  reminders,
  resources,
  todos,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { checkHabitToday } from "@/lib/operations";
import { todayDateString } from "@/lib/dates";

function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function addGoal(formData: FormData) {
  const title = asString(formData.get("title"));
  const description = asString(formData.get("description"));
  const targetDate = asString(formData.get("targetDate"));

  if (!title) return;

  await db.insert(goals).values({
    title,
    description,
    targetDate: targetDate || null,
  });

  revalidatePath("/");
}

export async function toggleGoal(formData: FormData) {
  const id = Number(asString(formData.get("id")));
  const completed = asString(formData.get("completed")) === "true";
  if (!id) return;

  await db.update(goals).set({ completed }).where(eq(goals.id, id));
  revalidatePath("/");
}

export async function logGoalProgress(formData: FormData) {
  const goalId = Number(asString(formData.get("goalId")));
  const note = asString(formData.get("note"));
  const completedToday = asString(formData.get("completedToday")) === "true";
  if (!goalId) return;

  await db.insert(goalLogs).values({
    goalId,
    note,
    completedToday,
    logDate: todayDateString(),
  });

  revalidatePath("/");
}

export async function addHabit(formData: FormData) {
  const name = asString(formData.get("name"));
  const category = asString(formData.get("category"));
  if (!name) return;

  await db.insert(habits).values({
    name,
    category: category || "General",
  });

  revalidatePath("/");
}

export async function markHabitDone(formData: FormData) {
  const habitId = Number(asString(formData.get("habitId")));
  if (!habitId) return;

  await checkHabitToday(habitId);
  revalidatePath("/");
}

export async function addReminder(formData: FormData) {
  const title = asString(formData.get("title"));
  const details = asString(formData.get("details"));
  const remindAt = asString(formData.get("remindAt"));
  if (!title || !remindAt) return;

  await db.insert(reminders).values({
    title,
    details,
    remindAt: new Date(remindAt),
  });

  revalidatePath("/");
}

export async function toggleReminder(formData: FormData) {
  const id = Number(asString(formData.get("id")));
  const done = asString(formData.get("done")) === "true";
  if (!id) return;

  await db.update(reminders).set({ done }).where(eq(reminders.id, id));
  revalidatePath("/");
}

export async function addTodo(formData: FormData) {
  const title = asString(formData.get("title"));
  const dueDate = asString(formData.get("dueDate"));
  const priority = asString(formData.get("priority"));
  if (!title) return;

  await db.insert(todos).values({
    title,
    dueDate: dueDate || null,
    priority: priority || "medium",
  });

  revalidatePath("/");
}

export async function toggleTodo(formData: FormData) {
  const id = Number(asString(formData.get("id")));
  const done = asString(formData.get("done")) === "true";
  if (!id) return;

  await db.update(todos).set({ done }).where(eq(todos.id, id));
  revalidatePath("/");
}

export async function addCalendarEvent(formData: FormData) {
  const title = asString(formData.get("title"));
  const eventDate = asString(formData.get("eventDate"));
  const notes = asString(formData.get("notes"));
  const startTime = asString(formData.get("startTime"));
  const endTime = asString(formData.get("endTime"));
  if (!title || !eventDate) return;

  await db.insert(calendarEvents).values({
    title,
    eventDate,
    notes,
    startTime: startTime || null,
    endTime: endTime || null,
  });

  revalidatePath("/");
}

export async function addLearningItem(formData: FormData) {
  const title = asString(formData.get("title"));
  const topic = asString(formData.get("topic"));
  const status = asString(formData.get("status"));
  const resourceUrl = asString(formData.get("resourceUrl"));
  const notes = asString(formData.get("notes"));
  if (!title) return;

  await db.insert(learningItems).values({
    title,
    topic: topic || "General",
    status: status || "planned",
    resourceUrl,
    notes,
  });

  revalidatePath("/");
}

export async function addResource(formData: FormData) {
  const title = asString(formData.get("title"));
  const kind = asString(formData.get("kind"));
  const url = asString(formData.get("url"));
  const notes = asString(formData.get("notes"));
  if (!title) return;

  await db.insert(resources).values({
    title,
    kind: kind || "pdf",
    url,
    notes,
  });

  revalidatePath("/");
}

export async function addDevelopmentLog(formData: FormData) {
  const focusArea = asString(formData.get("focusArea"));
  const reflection = asString(formData.get("reflection"));
  const mood = asString(formData.get("mood"));
  const logDate = asString(formData.get("logDate"));
  if (!focusArea || !reflection || !logDate) return;

  await db.insert(developmentLogs).values({
    focusArea,
    reflection,
    mood: mood || "neutral",
    logDate,
  });

  revalidatePath("/");
}

export async function addOpportunity(formData: FormData) {
  const field = asString(formData.get("field"));
  const title = asString(formData.get("title"));
  const location = asString(formData.get("location"));
  const sourceUrl = asString(formData.get("sourceUrl"));
  const details = asString(formData.get("details"));
  if (!field || !title) return;

  await db.insert(opportunities).values({
    field,
    title,
    location: location || "Remote",
    sourceUrl,
    details,
    updatedAt: new Date(),
  });

  revalidatePath("/");
}

export async function refreshOpportunityUpdates(formData: FormData) {
  const opportunityId = Number(asString(formData.get("opportunityId")));
  const field = asString(formData.get("field"));
  if (!opportunityId || !field) return;

  const response = await fetch(
    `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(field)}&tags=story&hitsPerPage=5`,
    { next: { revalidate: 0 } },
  );

  if (!response.ok) return;

  const data = (await response.json()) as {
    hits?: Array<{ title?: string; url?: string; story_text?: string }>;
  };

  const items = (data.hits ?? [])
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

  revalidatePath("/");
}
