import { db } from "@/db";
import { goalLogs, goals, habitLogs, habits, learningItems, reminders, todos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { todayDateString } from "@/lib/dates";

export async function GET() {
  const today = todayDateString();

  const [allGoals, allHabits, allTodos, allReminders, todayGoals, todayHabits, allLearning] = await Promise.all([
    db.select({ id: goals.id, completed: goals.completed }).from(goals),
    db.select({ id: habits.id }).from(habits),
    db.select({ id: todos.id, done: todos.done }).from(todos),
    db.select({ id: reminders.id, done: reminders.done }).from(reminders),
    db.select({ id: goalLogs.id }).from(goalLogs).where(eq(goalLogs.logDate, today)),
    db.select({ habitId: habitLogs.habitId }).from(habitLogs).where(eq(habitLogs.logDate, today)),
    db.select({ id: learningItems.id, status: learningItems.status }).from(learningItems),
  ]);

  const completedGoals = allGoals.filter((g) => g.completed).length;
  const completedTodos = allTodos.filter((t) => t.done).length;
  const pendingReminders = allReminders.filter((r) => !r.done).length;
  const habitsToday = new Set(todayHabits.map((h) => h.habitId)).size;
  const learningActive = allLearning.filter((l) => l.status === "in-progress").length;

  return NextResponse.json({
    today,
    stats: {
      goalsCompleted: completedGoals,
      totalGoals: allGoals.length,
      habitsToday,
      totalHabits: allHabits.length,
      todosDone: completedTodos,
      totalTodos: allTodos.length,
      pendingReminders,
      todayGoalLogs: todayGoals.length,
      learningActive,
    },
  });
}
