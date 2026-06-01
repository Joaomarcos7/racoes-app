import { formatCurrency } from "@/lib/utils"

interface KpiCardProps {
  label: string
  value: string | number
  isCurrency?: boolean
  subtext?: string
  accentColor?: string
}

export function KpiCard({ label, value, isCurrency, subtext, accentColor = "#0C5E3A" }: KpiCardProps) {
  return (
    <div className="bg-white rounded-lg border p-4" style={{ borderTop: `3px solid ${accentColor}` }}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-xl font-bold" style={{ color: accentColor }}>
        {isCurrency ? formatCurrency(Number(value)) : value}
      </p>
      {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
  )
}
