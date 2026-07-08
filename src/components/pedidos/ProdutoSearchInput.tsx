"use client"
import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { useProdutos } from "@/hooks/use-produtos"
import { formatCurrency } from "@/lib/utils"
import { TIPO_BADGE } from "@/lib/produto-utils"
import type { ProdutoDTO } from "@/types/api"

interface ProdutoSearchInputProps {
  onSelect: (produto: ProdutoDTO) => void
}

export function ProdutoSearchInput({ onSelect }: ProdutoSearchInputProps) {
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(t)
  }, [query])

  const { data: result } = useProdutos(debouncedQuery || undefined, 1, 50)
  const filtered = debouncedQuery ? (result?.data ?? []) : []

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function handleSelect(p: ProdutoDTO) {
    onSelect(p)
    setQuery("")
    setDebouncedQuery("")
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <Input
        placeholder="Buscar produto para adicionar..."
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => query && setOpen(true)}
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-10 top-full left-0 right-0 bg-white border rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
          {filtered.map((p) => (
            <button
              key={p.id}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex justify-between"
              onMouseDown={() => handleSelect(p)}
            >
              <span className="flex items-center gap-1.5">
                {p.nome}
                {TIPO_BADGE[p.tipo] && (
                  <span className={`text-[10px] px-1 py-0 rounded font-medium ${TIPO_BADGE[p.tipo].className}`}>{TIPO_BADGE[p.tipo].label}</span>
                )}
              </span>
              <span className="text-gray-500">{p.peso}kg · {formatCurrency(p.valorUnitario)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
