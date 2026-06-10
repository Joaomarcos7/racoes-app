import { formatCurrency } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface KpiCardProps {
  label: string
  value: string | number
  isCurrency?: boolean
  subtext?: string
  accentColor?: string
  icon?: LucideIcon
}

export function KpiCard({ label, value, isCurrency, subtext, accentColor = "#0C5E3A", icon: Icon }: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        {Icon && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${accentColor}15` }}>
            <Icon size={16} style={{ color: accentColor }} />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold tracking-tight" style={{ color: accentColor }}>
        {isCurrency ? formatCurrency(Number(value)) : value}
      </p>
      {subtext && <p className="text-xs text-slate-400 mt-1.5 font-medium">{subtext}</p>}
    </div>
  )
}
