"use client"
import { ChevronLeft, ChevronRight, CalendarDays, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardDatePickerProps {
  value: string | null
  onChange: (date: string | null) => void
}

function toLocalDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function formatLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" })
}

export function DashboardDatePicker({ value, onChange }: DashboardDatePickerProps) {
  const today = toLocalDateStr(new Date())

  function step(dir: -1 | 1) {
    const base = value ?? today
    const [y, m, d] = base.split("-").map(Number)
    const next = new Date(y, m - 1, d + dir)
    onChange(toLocalDateStr(next))
  }

  const isToday = value === today || value === null

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => step(-1)}
        className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-colors"
        title="Dia anterior"
      >
        <ChevronLeft size={14} />
      </button>

      <div className="relative">
        <div
          className={cn(
            "flex items-center gap-1.5 h-8 px-2.5 rounded-md border text-xs font-medium transition-colors cursor-pointer select-none",
            value
              ? "bg-blue-50 border-blue-300 text-blue-700"
              : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
          )}
        >
          <CalendarDays size={13} className={value ? "text-blue-500" : "text-slate-400"} />
          <label className="cursor-pointer">
            {value ? formatLabel(value) : "Dia específico"}
            <input
              type="date"
              value={value ?? ""}
              max={today}
              onChange={(e) => onChange(e.target.value || null)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full"
            />
          </label>
          {value && (
            <button
              onClick={(e) => { e.stopPropagation(); onChange(null) }}
              className="ml-0.5 text-blue-400 hover:text-blue-600 transition-colors"
              title="Limpar"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      <button
        onClick={() => !isToday && step(1)}
        disabled={isToday}
        className={cn(
          "w-7 h-7 flex items-center justify-center rounded-md border transition-colors",
          isToday
            ? "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
            : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:border-slate-300"
        )}
        title="Próximo dia"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  )
}
