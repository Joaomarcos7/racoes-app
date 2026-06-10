"use client"
import { useState, Fragment } from "react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import type { ProdutoDTO } from "@/types/api"
import { Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { ConfirmDeleteDialog } from "@/components/ui/ConfirmDeleteDialog"
import { ProdutoDetalhesPanel } from "./ProdutoDetalhesPanel"

interface ProdutoTableProps {
  produtos: ProdutoDTO[]
  onEdit: (p: ProdutoDTO) => void
  onDelete: (id: string) => void
}

export function ProdutoTable({ produtos, onEdit, onDelete }: ProdutoTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (produtos.length === 0) {
    return <p className="text-sm text-gray-500 py-4">Nenhum produto cadastrado.</p>
  }

  return (
    <div className="rounded-md border overflow-hidden overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Peso (kg)</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor Unit.</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((p, i) => {
            const isExpanded = expandedId === p.id
            return (
              <Fragment key={p.id}>
                <tr className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-3 font-medium">{p.nome}</td>
                  <td className="px-4 py-3 text-right">{p.peso}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(p.valorUnitario)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-1 justify-end">
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Ver detalhes"
                        onClick={() => setExpandedId(isExpanded ? null : p.id)}
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => onEdit(p)}>
                        <Pencil size={14} />
                      </Button>
                      <ConfirmDeleteDialog onConfirm={() => onDelete(p.id)}>
                        <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-700">
                          <Trash2 size={14} />
                        </Button>
                      </ConfirmDeleteDialog>
                    </div>
                  </td>
                </tr>
                {isExpanded && (
                  <tr key={`${p.id}-details`}>
                    <td colSpan={4} className="p-0">
                      <ProdutoDetalhesPanel produto={p} />
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
