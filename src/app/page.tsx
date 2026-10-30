import { db } from "@/db";
import {
  calendarEvents,
  developmentLogs,
  goalLogs,
  goals,
  habitLogs,
  habits,
  learningItems,
  opportunities,
  opportunityUpdates,
  reminders,
  resources,
  todos,
} from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import {
  addCalendarEvent,
  addDevelopmentLog,
  addGoal,
  addHabit,
  addLearningItem,
  addOpportunity,
  addReminder,
  addResource,
  addTodo,
  logGoalProgress,
  markHabitDone,
  refreshOpportunityUpdates,
  toggleGoal,
  toggleReminder,
  toggleTodo,
} from "./actions";
import { IosCalendar } from "@/components/ios-calendar";
import { SectionCard } from "@/components/section-card";
import { formatDateTime, todayDateString } from "@/lib/dates";

export const dynamic = "force-dynamic";

type Goal = InferSelectModel<typeof goals>;
type Habit = InferSelectModel<typeof habits>;
type Todo = InferSelectModel<typeof todos>;
type Reminder = InferSelectModel<typeof reminders>;
type LearningItem = InferSelectModel<typeof learningItems>;
type Resource = InferSelectModel<typeof resources>;
type DevelopmentLog = InferSelectModel<typeof developmentLogs>;
type Opportunity = InferSelectModel<typeof opportunities>;
type OpportunityUpdate = InferSelectModel<typeof opportunityUpdates>;
type CalendarEventRow = InferSelectModel<typeof calendarEvents>;
type HabitLog = InferSelectModel<typeof habitLogs>;

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100";
const labelClass = "mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500";
const submitClass =
  "inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2";
const toggleClass = (active: boolean) =>
  `inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
    active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600 hover:bg-slate-300"
  }`;

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function prettyToday() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function StatCard({ href, label, value, tone }: { href: string; label: string; value: string; tone: string }) {
  return (
    <a
      href={href}
      className="group rounded-2xl border border-slate-100 bg-white/90 p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
      <span className={`mt-2 block h-1.5 w-8 rounded-full ${tone}`} />
    </a>
  );
}

export default async function HomePage() {
  const today = todayDateString();

  const [
    allGoals,
    todayGoalLogs,
    allHabits,
    todayHabitLogs,
    allReminders,
    allTodos,
    allEvents,
    allLearningItems,
    allResources,
    allDevLogs,
    allOpportunities,
    allOpportunityUpdates,
  ] = await Promise.all([
    db.select().from(goals).orderBy(desc(goals.createdAt)),
    db.select().from(goalLogs).where(eq(goalLogs.logDate, today)).orderBy(desc(goalLogs.createdAt)),
    db.select().from(habits).orderBy(desc(habits.createdAt)),
    db.select().from(habitLogs).where(eq(habitLogs.logDate, today)).orderBy(desc(habitLogs.createdAt)),
    db.select().from(reminders).orderBy(desc(reminders.remindAt)),
    db.select().from(todos).orderBy(desc(todos.createdAt)),
    db.select().from(calendarEvents).orderBy(desc(calendarEvents.eventDate)),
    db.select().from(learningItems).orderBy(desc(learningItems.createdAt)),
    db.select().from(resources).orderBy(desc(resources.createdAt)),
    db.select().from(developmentLogs).orderBy(desc(developmentLogs.createdAt)),
    db.select().from(opportunities).orderBy(desc(opportunities.updatedAt)),
    db.select().from(opportunityUpdates).orderBy(desc(opportunityUpdates.createdAt)),
  ]);

  const completedGoals = allGoals.filter((goal) => goal.completed).length;
  const completedHabitsToday = new Set(todayHabitLogs.map((log) => log.habitId)).size;
  const completedTodos = allTodos.filter((todo) => todo.done).length;
  const pendingReminders = allReminders.filter((r) => !r.done).length;
  const learningInProgress = allLearningItems.filter((item) => item.status === "in-progress").length;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_0%_0%,#dbeafe_0%,#eef2ff_30%,#f8fafc_100%)] px-4 py-8 md:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="rounded-[2.25rem] border border-white/70 bg-white/75 p-6 shadow-[0_20px_50px_rgba(30,41,59,0.12)] backdrop-blur-xl md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">Mitra</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                Personal Growth, Productivity & Planning OS
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
                iOS-inspired fullstack workspace for daily goals, habits, tasks, planning, learning, and career
                opportunities.
              </p>
            </div>
            <div className="rounded-2xl bg-blue-50 px-5 py-3 text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">{greeting()}</p>
              <p className="mt-1 text-sm font-semibold text-blue-900">{prettyToday()}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <StatCard href="#goals" label="Goals Completed" value={`${completedGoals}/${allGoals.length}`} tone="bg-emerald-400" />
            <StatCard href="#habits" label="Habits Today" value={`${completedHabitsToday}/${allHabits.length}`} tone="bg-blue-400" />
            <StatCard href="#todos" label="Todos Done" value={`${completedTodos}/${allTodos.length}`} tone="bg-violet-400" />
            <StatCard href="#reminders" label="Pending Reminders" value={`${pendingReminders}`} tone="bg-amber-400" />
            <StatCard href="#learning" label="Learning In Progress" value={`${learningInProgress}`} tone="bg-rose-400" />
          </div>
        </header>

        {/* Daily execution */}
        <div className="grid gap-6 xl:grid-cols-3">
          <SectionCard
            id="goals"
            title="Daily Goals & Progress"
            subtitle="Create measurable daily goals and log progress."
            className="xl:col-span-2"
          >
            <form action={addGoal} className="grid gap-3">
              <div>
                <label htmlFor="goal-title" className={labelClass}>
                  Goal title
                </label>
                <input
                  id="goal-title"
                  name="title"
                  required
                  placeholder="e.g. Ship the new dashboard"
                  className={inputClass}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label htmlFor="goal-description" className={labelClass}>
                    Short description
                  </label>
                  <input
                    id="goal-description"
                    name="description"
                    placeholder="What does success look like?"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="goal-target-date" className={labelClass}>
                    Target date
                  </label>
                  <input id="goal-target-date" name="targetDate" type="date" className={inputClass} />
                </div>
              </div>
              <button type="submit" className={submitClass}>
                Add Goal
              </button>
            </form>

            <div className="mt-5 space-y-3">
              {allGoals.length === 0 ? (
                <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                  No goals yet. Add your first goal above to start tracking.
                </p>
              ) : (
                allGoals.slice(0, 8).map((goal) => (
                  <div key={goal.id} className="rounded-2xl border border-slate-100 bg-white p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">{goal.title}</p>
                        <p className="text-xs text-slate-500">
                          Target: {goal.targetDate ?? "No date"} • {goal.description || "No description"}
                        </p>
                      </div>
                      <form action={toggleGoal}>
                        <input type="hidden" name="id" value={goal.id} />
                        <input type="hidden" name="completed" value={goal.completed ? "false" : "true"} />
                        <button
                          type="submit"
                          className={toggleClass(goal.completed)}
                        >
                          {goal.completed ? "Completed" : "Mark Done"}
                        </button>
                      </form>
                    </div>

                    <form action={logGoalProgress} className="mt-2 flex flex-wrap gap-2">
                      <input type="hidden" name="goalId" value={goal.id} />
                      <input name="note" placeholder="Progress note" className={inputClass} />
                      <button
                        type="submit"
                        name="completedToday"
                        value="false"
                        className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700"
                      >
                        Log
                      </button>
                      <button
                        type="submit"
                        name="completedToday"
                        value="true"
                        className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-medium text-white"
                      >
                        Done Today
                      </button>
                    </form>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Today&apos;s Goal Logs</p>
              {todayGoalLogs.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">No logs yet today. You&apos;re all set.</p>
              ) : (
                <ul className="mt-2 space-y-1 text-sm text-slate-700">
                  {todayGoalLogs.slice(0, 5).map((log) => (
                    <li key={log.id}>
                      • Goal #{log.goalId} — {log.note || "No note"} {log.completedToday ? "✅" : ""}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Habits" subtitle="Daily check-ins to build consistency.">
            <form action={addHabit} className="grid gap-3">
              <div>
                <label htmlFor="habit-name" className={labelClass}>
                  Habit name
                </label>
                <input id="habit-name" name="name" required placeholder="e.g. Morning meditation" className={inputClass} />
              </div>
              <div>
                <label htmlFor="habit-category" className={labelClass}>
                  Category
                </label>
                <input id="habit-category" name="category" placeholder="e.g. Health" className={inputClass} />
              </div>
              <button type="submit" className={submitClass}>
                Add Habit
              </button>
            </form>

            <div className="mt-5 space-y-2">
              {allHabits.length === 0 ? (
                <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No habits yet. Add one above.</p>
              ) : (
                allHabits.slice(0, 10).map((habit) => {
                  const doneToday = todayHabitLogs.some((log) => log.habitId === habit.id);
                  return (
                    <div key={habit.id} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800">{habit.name}</p>
                        <p className="text-xs text-slate-500">{habit.category}</p>
                      </div>
                      <form action={markHabitDone}>
                        <input type="hidden" name="habitId" value={habit.id} />
                        <button type="submit" className={toggleClass(doneToday)}>
                          {doneToday ? "Done Today" : "Check In"}
                        </button>
                      </form>
                    </div>
                  );
                })
              )}
            </div>
          </SectionCard>
        </div>

        {/* Plan */}
        <div className="grid gap-6 xl:grid-cols-3">
          <SectionCard title="Calendar" subtitle="Plan events and review your month at a glance." className="xl:col-span-2">
            <form action={addCalendarEvent} className="grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <label htmlFor="event-title" className={labelClass}>
                  Event title
                </label>
                <input
                  id="event-title"
                  name="title"
                  required
                  placeholder="e.g. Deep work session"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="event-date" className={labelClass}>
                  Date
                </label>
                <input id="event-date" name="eventDate" type="date" required className={inputClass} />
              </div>
              <div>
                <label htmlFor="event-start" className={labelClass}>
                  Start time
                </label>
                <input id="event-start" name="startTime" type="time" className={inputClass} />
              </div>
              <div>
                <label htmlFor="event-end" className={labelClass}>
                  End time
                </label>
                <input id="event-end" name="endTime" type="time" className={inputClass} />
              </div>
              <div>
                <label htmlFor="event-notes" className={labelClass}>
                  Notes
                </label>
                <input id="event-notes" name="notes" placeholder="Optional notes" className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <button type="submit" className={submitClass}>
                  Add Event
                </button>
              </div>
            </form>

            <div className="mt-5">
              <IosCalendar
                events={allEvents.map((e) => ({
                  id: e.id,
                  title: e.title,
                  eventDate: e.eventDate,
                  startTime: e.startTime,
                  notes: e.notes,
                }))}
              />
            </div>
          </SectionCard>

          <SectionCard title="To-Do Lists" subtitle="Prioritized task capture and completion tracking.">
            <form action={addTodo} className="grid gap-3">
              <div>
                <label htmlFor="todo-title" className={labelClass}>
                  Task title
                </label>
                <input
                  id="todo-title"
                  name="title"
                  required
                  placeholder="e.g. Review pull requests"
                  className={inputClass}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label htmlFor="todo-due" className={labelClass}>
                    Due date
                  </label>
                  <input id="todo-due" name="dueDate" type="date" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="todo-priority" className={labelClass}>
                    Priority
                  </label>
                  <select id="todo-priority" name="priority" defaultValue="medium" className={inputClass}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <button type="submit" className={submitClass}>
                Add Todo
              </button>
            </form>

            <div className="mt-5 space-y-2">
              {allTodos.length === 0 ? (
                <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No todos yet. Add one above.</p>
              ) : (
                allTodos.slice(0, 10).map((todo) => (
                  <div key={todo.id} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800">{todo.title}</p>
                      <p className="text-xs text-slate-500">
                        {todo.priority.toUpperCase()}
                        {todo.dueDate ? ` • Due: ${todo.dueDate}` : ""}
                      </p>
                    </div>
                    <form action={toggleTodo}>
                      <input type="hidden" name="id" value={todo.id} />
                      <input type="hidden" name="done" value={todo.done ? "false" : "true"} />
                      <button type="submit" className={toggleClass(todo.done)}>
                        {todo.done ? "Done" : "Open"}
                      </button>
                    </form>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>

        {/* Reminders */}
        <SectionCard title="Reminders" subtitle="Schedule and close personal reminders.">
          <form action={addReminder} className="grid gap-3 md:grid-cols-2">
            <div>
              <label htmlFor="reminder-title" className={labelClass}>
                Reminder title
              </label>
              <input
                id="reminder-title"
                name="title"
                required
                placeholder="e.g. Follow up with mentor"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="reminder-details" className={labelClass}>
                Details
              </label>
              <input id="reminder-details" name="details" placeholder="Optional details" className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="reminder-time" className={labelClass}>
                Remind at
              </label>
              <input id="reminder-time" name="remindAt" type="datetime-local" required className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className={submitClass}>
                Add Reminder
              </button>
            </div>
          </form>

          <div className="mt-5 space-y-2">
            {allReminders.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No reminders scheduled.</p>
            ) : (
              allReminders.slice(0, 8).map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">{item.title}</p>
                    {item.details ? <p className="text-xs text-slate-500">{item.details}</p> : null}
                    <p className="text-xs text-slate-400">{formatDateTime(item.remindAt)}</p>
                  </div>
                  <form action={toggleReminder}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="done" value={item.done ? "false" : "true"} />
                    <button type="submit" className={toggleClass(item.done)}>
                      {item.done ? "Done" : "Pending"}
                    </button>
                  </form>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        {/* Growth */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <SectionCard title="Learning List" subtitle="Track what you want to learn and progress status." id="learning">
            <form action={addLearningItem} className="grid gap-3">
              <div>
                <label htmlFor="learning-title" className={labelClass}>
                  Learning goal
                </label>
                <input
                  id="learning-title"
                  name="title"
                  required
                  placeholder="e.g. Master Rust ownership"
                  className={inputClass}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label htmlFor="learning-topic" className={labelClass}>
                    Topic
                  </label>
                  <input id="learning-topic" name="topic" placeholder="e.g. Systems" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="learning-status" className={labelClass}>
                    Status
                  </label>
                  <select id="learning-status" name="status" defaultValue="planned" className={inputClass}>
                    <option value="planned">Planned</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="learning-url" className={labelClass}>
                  Resource URL
                </label>
                <input id="learning-url" name="resourceUrl" placeholder="https://…" className={inputClass} />
              </div>
              <div>
                <label htmlFor="learning-notes" className={labelClass}>
                  Notes
                </label>
                <textarea
                  id="learning-notes"
                  name="notes"
                  rows={2}
                  placeholder="Key takeaways, links…"
                  className={`${inputClass} resize-none`}
                />
              </div>
              <button type="submit" className={submitClass}>
                Add Learning Item
              </button>
            </form>

            <ul className="mt-5 space-y-2">
              {allLearningItems.length === 0 ? (
                <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No learning items yet.</p>
              ) : (
                allLearningItems.slice(0, 8).map((item) => (
                  <li key={item.id} className="rounded-xl bg-slate-50 px-3 py-2">
                    <p className="text-sm font-medium text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-500">
                      {item.topic} • {item.status}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </SectionCard>

          <SectionCard title="Personal Development" subtitle="Daily reflection for self-growth and mindset.">
            <form action={addDevelopmentLog} className="grid gap-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label htmlFor="dev-focus" className={labelClass}>
                    Focus area
                  </label>
                  <input
                    id="dev-focus"
                    name="focusArea"
                    required
                    placeholder="e.g. Frontend architecture"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="dev-date" className={labelClass}>
                    Date
                  </label>
                  <input id="dev-date" name="logDate" type="date" defaultValue={today} className={inputClass} />
                </div>
              </div>
              <div>
                <label htmlFor="dev-mood" className={labelClass}>
                  Mood
                </label>
                <select id="dev-mood" name="mood" defaultValue="neutral" className={inputClass}>
                  <option value="great">Great</option>
                  <option value="good">Good</option>
                  <option value="neutral">Neutral</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label htmlFor="dev-reflection" className={labelClass}>
                  Reflection
                </label>
                <textarea
                  id="dev-reflection"
                  name="reflection"
                  required
                  rows={3}
                  placeholder="What did you learn today?"
                  className={`${inputClass} resize-none`}
                />
              </div>
              <button type="submit" className={submitClass}>
                Add Reflection
              </button>
            </form>

            <ul className="mt-5 space-y-2">
              {allDevLogs.length === 0 ? (
                <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No reflections logged yet.</p>
              ) : (
                allDevLogs.slice(0, 6).map((log) => (
                  <li key={log.id} className="rounded-xl bg-slate-50 px-3 py-2">
                    <p className="text-sm font-medium text-slate-800">
                      {log.focusArea} • {log.mood}
                    </p>
                    <p className="text-xs text-slate-500">{log.logDate}</p>
                    <p className="mt-1 text-sm text-slate-700">{log.reflection}</p>
                  </li>
                ))
              )}
            </ul>
          </SectionCard>

          <SectionCard title="PDF Store & Wishlist" subtitle="Save PDFs and resources to wishlist in one place.">
            <form action={addResource} className="grid gap-3">
              <div>
                <label htmlFor="resource-title" className={labelClass}>
                  Title
                </label>
                <input
                  id="resource-title"
                  name="title"
                  required
                  placeholder="e.g. Designing Data-Intensive Applications"
                  className={inputClass}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label htmlFor="resource-kind" className={labelClass}>
                    Kind
                  </label>
                  <select id="resource-kind" name="kind" defaultValue="pdf" className={inputClass}>
                    <option value="pdf">PDF</option>
                    <option value="wishlist">Wishlist</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="resource-url" className={labelClass}>
                    URL / file link
                  </label>
                  <input id="resource-url" name="url" placeholder="https://…" className={inputClass} />
                </div>
              </div>
              <div>
                <label htmlFor="resource-notes" className={labelClass}>
                  Notes
                </label>
                <input id="resource-notes" name="notes" placeholder="Why it matters…" className={inputClass} />
              </div>
              <button type="submit" className={submitClass}>
                Save Resource
              </button>
            </form>

            <ul className="mt-5 space-y-2">
              {allResources.length === 0 ? (
                <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No saved resources yet.</p>
              ) : (
                allResources.slice(0, 8).map((resource) => (
                  <li key={resource.id} className="rounded-xl bg-slate-50 px-3 py-2">
                    <p className="text-sm font-medium text-slate-800">{resource.title}</p>
                    <p className="text-xs text-slate-500">
                      {resource.kind.toUpperCase()}
                      {resource.url ? ` • ${resource.url}` : ""}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </SectionCard>
        </div>

        {/* Opportunities */}
        <SectionCard
          title="Field Opportunities + Daily Updates"
          subtitle="Add opportunities and fetch daily field-related updates, jobs, and news."
        >
          <form action={addOpportunity} className="grid gap-3 md:grid-cols-2">
            <div>
              <label htmlFor="opportunity-field" className={labelClass}>
                Field (e.g. AI, Flutter, Design)
              </label>
              <input
                id="opportunity-field"
                name="field"
                required
                placeholder="e.g. AI"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="opportunity-title" className={labelClass}>
                Opportunity title
              </label>
              <input
                id="opportunity-title"
                name="title"
                required
                placeholder="e.g. Staff Engineer, AI Platform"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="opportunity-location" className={labelClass}>
                Location
              </label>
              <input id="opportunity-location" name="location" placeholder="e.g. Remote" className={inputClass} />
            </div>
            <div>
              <label htmlFor="opportunity-source" className={labelClass}>
                Source URL
              </label>
              <input id="opportunity-source" name="sourceUrl" placeholder="https://…" className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="opportunity-details" className={labelClass}>
                Basic details
              </label>
              <input
                id="opportunity-details"
                name="details"
                placeholder="Role, team, stack…"
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className={submitClass}>
                Add Opportunity
              </button>
            </div>
          </form>

          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {allOpportunities.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 lg:col-span-2">
                No opportunities tracked yet. Add one above.
              </p>
            ) : (
              allOpportunities.slice(0, 6).map((op) => {
                const updates = allOpportunityUpdates
                  .filter((u) => u.opportunityId === op.id)
                  .slice(0, 3);
                return (
                  <div key={op.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{op.title}</p>
                        <p className="text-xs text-slate-500">
                          {op.field} • {op.location}
                        </p>
                      </div>
                      <form action={refreshOpportunityUpdates}>
                        <input type="hidden" name="opportunityId" value={op.id} />
                        <input type="hidden" name="field" value={op.field} />
                        <button
                          type="submit"
                          className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
                        >
                          Fetch Updates
                        </button>
                      </form>
                    </div>

                    <ul className="mt-2 space-y-1 text-xs text-slate-600">
                      {updates.map((update) => (
                        <li key={update.id}>
                          • {update.headline}
                          {update.url ? (
                            <a
                              href={update.url}
                              target="_blank"
                              className="ml-1 text-blue-600 underline"
                              rel="noreferrer"
                            >
                              link
                            </a>
                          ) : null}
                        </li>
                      ))}
                      {updates.length === 0 ? <li>No updates yet. Tap “Fetch Updates”.</li> : null}
                    </ul>
                  </div>
                );
              })
            )}
          </div>
        </SectionCard>
      </div>

      <footer className="mt-10 text-center text-xs text-slate-400">
        Mitra · Your personal growth, productivity & planning operating system.
      </footer>
    </main>
  );
}
