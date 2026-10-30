"use client";

import { useMemo, useState } from "react";

type CalendarEvent = {
  id: number;
  title: string;
  eventDate: string;
  startTime: string | null;
  notes?: string;
};

type Props = {
  events: CalendarEvent[];
};

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  );
}

export function IosCalendar({ events }: Props) {
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const monthData = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const first = new Date(year, month, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: Array<Date | null> = [];
    for (let i = 0; i < startDay; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) cells.push(new Date(year, month, day));
    while (cells.length % 7 !== 0) cells.push(null);

    return cells;
  }, [viewDate]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const key = event.eventDate.slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)?.push(event);
    }
    return map;
  }, [events]);

  const todayKey = toDateKey(today);
  const selectedKey = toDateKey(selectedDate);

  const selectedEvents = useMemo(() => {
    const list = eventsByDate.get(selectedKey) ?? [];
    return [...list].sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? ""));
  }, [eventsByDate, selectedKey]);

  const shiftMonth = (delta: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1));
  };

  const goToToday = () => {
    const now = new Date();
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  };

  return (
    <div className="rounded-3xl border border-white/50 bg-white/80 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          onClick={() => shiftMonth(-1)}
          aria-label="Previous month"
        >
          ‹
        </button>
        <h3 className="text-lg font-semibold text-slate-900">
          {viewDate.toLocaleString("en-US", { month: "long", year: "numeric" })}
        </h3>
        <button
          type="button"
          className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          onClick={() => shiftMonth(1)}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
        {weekdays.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {monthData.map((cell, index) => {
          if (!cell) {
            return <div key={`empty-${index}`} className="h-20 rounded-2xl bg-slate-50" />;
          }

          const key = toDateKey(cell);
          const dayEvents = eventsByDate.get(key) ?? [];
          const isToday = key === todayKey;
          const isSelected = key === selectedKey;

          return (
            <div
              key={key}
              onClick={() => setSelectedDate(cell)}
              className={`h-20 cursor-pointer rounded-2xl border p-2 transition ${
                isSelected
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                  : isToday
                    ? "border-blue-400 bg-blue-50"
                    : "border-slate-100 bg-white hover:border-slate-200"
              }`}
            >
              <p
                className={`text-xs font-semibold ${isToday || isSelected ? "text-blue-700" : "text-slate-700"}`}
              >
                {cell.getDate()}
              </p>
              <div className="mt-1 space-y-1">
                {dayEvents.slice(0, 2).map((event) => (
                  <p
                    key={event.id}
                    className={`truncate rounded-lg px-1.5 py-0.5 text-[10px] font-medium ${
                      isSelected || isToday ? "bg-violet-100 text-violet-700" : "bg-violet-50 text-violet-600"
                    }`}
                  >
                    {event.startTime ? `${event.startTime} ` : ""}
                    {event.title}
                  </p>
                ))}
                {dayEvents.length > 2 ? (
                  <p className="text-[10px] font-medium text-slate-500">+{dayEvents.length - 2} more</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl bg-slate-50 p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          {!isSameDay(selectedDate, today) ? (
            <button
              type="button"
              onClick={goToToday}
              className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-600 shadow-sm transition hover:bg-blue-50"
            >
              Back to today
            </button>
          ) : null}
        </div>

        {selectedEvents.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No events scheduled for this day.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {selectedEvents.map((event) => (
              <li key={event.id} className="rounded-xl bg-white p-3 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">
                  {event.startTime ? `${event.startTime} ` : ""}
                  {event.title}
                </p>
                {event.notes ? <p className="mt-1 text-xs text-slate-500">{event.notes}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
