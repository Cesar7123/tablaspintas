"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Mode = "date" | "datetime";

type DateTimeProps = {
  id: string;
  label: string;
  mode: Mode;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  min?: string;
  max?: string;
  helperText?: string;
  className?: string;
};

const WEEKDAYS = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];
const HOURS = Array.from({ length: 24 }, (_, index) => index);
const MINUTES = Array.from({ length: 60 }, (_, index) => index);
const MONTH_FORMAT = new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric" });

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function toInputValue(date: Date, mode: Mode) {
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return mode === "datetime" ? `${day}T${pad(date.getHours())}:${pad(date.getMinutes())}` : day;
}

function parseValue(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/.exec(value);
  if (!match) return null;
  const [, year, month, day, hours = "0", minutes = "0"] = match;
  return new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes));
}

export function DateTime({
  id,
  label,
  mode,
  value,
  onChange,
  required = false,
  disabled = false,
  min,
  max,
  helperText,
  className,
}: DateTimeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const helperId = useId();
  const selected = parseValue(value);
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(selected ?? new Date()));

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const toggle = () => {
    if (!open) setViewMonth(startOfMonth(selected ?? new Date()));
    setOpen(!open);
  };

  const withDate = (day: Date) => {
    const hours = selected?.getHours() ?? 9;
    const minutes = selected?.getMinutes() ?? 0;
    onChange(
      toInputValue(
        new Date(day.getFullYear(), day.getMonth(), day.getDate(), hours, minutes),
        mode,
      ),
    );
  };

  const pickDay = (day: Date) => {
    withDate(day);
    if (mode === "date") setOpen(false);
  };

  const pickTime = (hours: number, minutes: number) => {
    const base = selected ?? new Date();
    onChange(
      toInputValue(
        new Date(base.getFullYear(), base.getMonth(), base.getDate(), hours, minutes),
        "datetime",
      ),
    );
  };

  const isOutOfRange = (day: Date) => {
    const key = toInputValue(day, "date");
    return Boolean((min && key < min) || (max && key > max));
  };

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const offset = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const today = new Date();
  const display = selected
    ? new Intl.DateTimeFormat(
        "es-MX",
        mode === "datetime" ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "long" },
      ).format(selected)
    : null;
  const placeholder = mode === "datetime" ? "Selecciona fecha y hora" : "Selecciona una fecha";

  return (
    <div ref={rootRef} className={cn("relative flex flex-col gap-2", className)}>
      <Label htmlFor={id}>
        {label}
        {required && <span aria-hidden className="ml-1 text-brand">*</span>}
      </Label>
      <button
        id={id}
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-describedby={helperText ? helperId : undefined}
        onClick={toggle}
        className="flex h-10 w-full items-center gap-2.5 rounded-md border border-input bg-card px-3 text-left text-sm shadow-sm transition-colors hover:border-brand/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
      >
        {mode === "datetime" ? (
          <Clock aria-hidden className="size-4 shrink-0 text-brand" />
        ) : (
          <CalendarDays aria-hidden className="size-4 shrink-0 text-brand" />
        )}
        <span className={cn("flex-1 truncate", !display && "text-muted-foreground/70")}>
          {display ?? placeholder}
        </span>
      </button>
      {helperText && (
        <p id={helperId} className="text-xs text-muted-foreground">
          {helperText}
        </p>
      )}
      {open && (
        <div
          role="dialog"
          aria-label={label}
          className="absolute left-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-card p-4 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Mes anterior"
              onClick={() => setViewMonth(new Date(year, month - 1, 1))}
            >
              <ChevronLeft aria-hidden />
            </Button>
            <p className="text-sm font-semibold capitalize" aria-live="polite">
              {MONTH_FORMAT.format(viewMonth)}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Mes siguiente"
              onClick={() => setViewMonth(new Date(year, month + 1, 1))}
            >
              <ChevronRight aria-hidden />
            </Button>
          </div>
          <div className="mt-3 grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((weekday) => (
              <span key={weekday} className="py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {weekday}
              </span>
            ))}
            {cells.map((day, index) => {
              if (!day) return <span key={`empty-${index}`} />;
              const isSelected = selected ? isSameDay(day, selected) : false;
              const isToday = isSameDay(day, today);
              return (
                <button
                  key={day.getTime()}
                  type="button"
                  disabled={isOutOfRange(day)}
                  aria-pressed={isSelected}
                  aria-label={day.toLocaleDateString("es-MX", { dateStyle: "long" })}
                  onClick={() => pickDay(day)}
                  className={cn(
                    "h-9 rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-35",
                    isSelected
                      ? "bg-primary font-semibold text-primary-foreground shadow-sm"
                      : "text-foreground hover:bg-accent",
                    isToday && !isSelected && "font-semibold text-brand ring-1 ring-inset ring-brand/50",
                  )}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
          {mode === "datetime" && (
            <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
              <Clock aria-hidden className="size-4 shrink-0 text-brand" />
              <span className="text-sm text-muted-foreground">Hora</span>
              <select
                aria-label="Hora"
                disabled={!selected}
                value={selected ? selected.getHours() : 9}
                onChange={(event) => pickTime(Number(event.target.value), selected?.getMinutes() ?? 0)}
                className="h-9 rounded-md border border-input bg-card px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              >
                {HOURS.map((hour) => (
                  <option key={hour} value={hour}>
                    {pad(hour)}
                  </option>
                ))}
              </select>
              <span className="font-semibold">:</span>
              <select
                aria-label="Minutos"
                disabled={!selected}
                value={selected ? selected.getMinutes() : 0}
                onChange={(event) => pickTime(selected?.getHours() ?? 9, Number(event.target.value))}
                className="h-9 rounded-md border border-input bg-card px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              >
                {MINUTES.map((minute) => (
                  <option key={minute} value={minute}>
                    {pad(minute)}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
            <Button type="button" variant="ghost" size="sm" onClick={() => withDate(new Date())}>
              Hoy
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => onChange("")}>
                Limpiar
              </Button>
              <Button type="button" variant="brand" size="sm" onClick={() => setOpen(false)}>
                Listo
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
