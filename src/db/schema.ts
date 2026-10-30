import {
  boolean,
  date,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  description: text("description").notNull().default(""),
  targetDate: date("target_date"),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const goalLogs = pgTable("goal_logs", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id")
    .notNull()
    .references(() => goals.id, { onDelete: "cascade" }),
  logDate: date("log_date").notNull(),
  note: text("note").notNull().default(""),
  completedToday: boolean("completed_today").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  category: varchar("category", { length: 80 }).notNull().default("General"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const habitLogs = pgTable("habit_logs", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id")
    .notNull()
    .references(() => habits.id, { onDelete: "cascade" }),
  logDate: date("log_date").notNull(),
  completed: boolean("completed").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  details: text("details").notNull().default(""),
  remindAt: timestamp("remind_at", { withTimezone: true }).notNull(),
  done: boolean("done").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const todos = pgTable("todos", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  dueDate: date("due_date"),
  priority: varchar("priority", { length: 20 }).notNull().default("medium"),
  done: boolean("done").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  notes: text("notes").notNull().default(""),
  eventDate: date("event_date").notNull(),
  startTime: varchar("start_time", { length: 10 }),
  endTime: varchar("end_time", { length: 10 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const learningItems = pgTable("learning_items", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  topic: varchar("topic", { length: 120 }).notNull().default("General"),
  status: varchar("status", { length: 32 }).notNull().default("planned"),
  resourceUrl: text("resource_url").notNull().default(""),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  kind: varchar("kind", { length: 20 }).notNull().default("pdf"),
  url: text("url").notNull().default(""),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const developmentLogs = pgTable("development_logs", {
  id: serial("id").primaryKey(),
  focusArea: varchar("focus_area", { length: 120 }).notNull(),
  reflection: text("reflection").notNull(),
  mood: varchar("mood", { length: 40 }).notNull().default("neutral"),
  logDate: date("log_date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const opportunities = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  field: varchar("field", { length: 140 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  location: varchar("location", { length: 140 }).notNull().default("Remote"),
  sourceUrl: text("source_url").notNull().default(""),
  details: text("details").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const opportunityUpdates = pgTable("opportunity_updates", {
  id: serial("id").primaryKey(),
  opportunityId: integer("opportunity_id")
    .notNull()
    .references(() => opportunities.id, { onDelete: "cascade" }),
  headline: varchar("headline", { length: 260 }).notNull(),
  url: text("url").notNull().default(""),
  summary: text("summary").notNull().default(""),
  updateDate: date("update_date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
