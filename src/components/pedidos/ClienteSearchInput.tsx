"use client"
import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useClientes } from "@/hooks/use-clientes"
import { X } from "lucide-react"
import type { ClienteDTO } from "@/types/api"

interface ClienteSearchInputProps {
  onSelect: (cliente: ClienteDTO) => void
  onClear: () => void
  selected: ClienteDTO | null
  placeholder?: string
  required?: boolean
}

export function ClienteSearchInput({ onSelect, onClear, selected, placeholder = "Buscar cliente...", required }: ClienteSearchInputProps) {
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 250)
    return () => clearTimeout(t)
  }, [query])

  const { data: result } = useClientes({ search: debouncedQuery || undefined, page: 1, limit: 20 })
  const filtered = debouncedQuery ? (result?.data ?? []) : []

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function handleSelect(c: ClienteDTO) {
    onSelect(c)
    setQuery("")
    setDebouncedQuery("")
    setOpen(false)
  }

  if (selected) {
    return (
      <div className="flex items-center gap-2 rounded-md border px-3 py-2 bg-blue-50 border-blue-200">
        <span className="text-sm font-medium text-blue-900 flex-1">{selected.nome} — {selected.cidade}</span>
        <Button type="button" size="icon" variant="ghost" className="h-5 w-5 text-blue-500 hover:text-blue-700 hover:bg-transparent" onClick={onClear}>
          <X size={12} />
        </Button>
      </div>
    )
  }

  return (
    <div className="relative" ref={ref}>
      <Input
        placeholder={placeholder}
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => query && setOpen(true)}
        required={required && !selected}
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-10 top-full left-0 right-0 bg-white border rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
          {filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex justify-between"
              onMouseDown={() => handleSelect(c)}
            >
              <span>{c.nome}</span>
              <span className="text-gray-500 text-xs">{c.cidade}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
