"use client"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"

const LIMIT_OPTIONS = [10, 15, 25, 50]

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  limit: number
  onPageChange: (page: number) => void
  onLimitChange?: (limit: number) => void
}

export function Pagination({ page, totalPages, total, limit, onPageChange, onLimitChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-between mt-4 text-sm">
      <div className="flex items-center gap-4 text-slate-500">
        <span>{total} itens</span>
        <span>Página {page} de {totalPages}</span>
      </div>
      <div className="flex items-center gap-2">
        {onLimitChange && (
          <Select value={String(limit)} onValueChange={(v) => { onLimitChange(Number(v)); onPageChange(1) }}>
            <SelectTrigger className="h-8 w-32 text-sm">
              <SelectValue>{limit} por página</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {LIMIT_OPTIONS.map((n) => (
                <SelectItem key={n} value={String(n)}>{n} por página</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Button
          variant="outline"
          size="sm"
          aria-label="Anterior"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={14} className="mr-1" />
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          aria-label="Próxima"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Próxima
          <ChevronRight size={14} className="ml-1" />
        </Button>
      </div>
    </div>
  )
}
