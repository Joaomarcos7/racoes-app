"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { labelTipoProduto } from "@/lib/produto-utils"
import type { ProdutoDTO } from "@/types/api"
import { Pencil, Trash2, Plus } from "lucide-react"
import { ConfirmDeleteDialog } from "@/components/ui/ConfirmDeleteDialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ProdutoTableProps {
  produtos: ProdutoDTO[]
  onEdit: (p: ProdutoDTO) => void
  onDelete: (id: string) => void
}

export function ProdutoTable({ produtos, onEdit, onDelete }: ProdutoTableProps) {
  if (produtos.length === 0) {
    return <p className="text-sm text-gray-500 py-4">Nenhum produto cadastrado.</p>
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Tipo</th>
            <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Peso (kg)</th>
            <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Valor Unit.</th>
            <th className="px-3 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((p, i) => (
            <tr key={p.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-3 py-3 font-medium">{p.nome}</td>
              <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">{labelTipoProduto(p.tipo)}</td>
              <td className="px-3 py-3 text-right whitespace-nowrap">{p.peso}</td>
              <td className="px-3 py-3 text-right whitespace-nowrap">{formatCurrency(p.valorUnitario)}</td>
              <td className="px-3 py-3 text-right whitespace-nowrap">
                <div className="flex gap-1 justify-end">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="icon" variant="ghost" asChild>
                          <Link href={`/produtos/${p.id}`}>
                            <Plus size={14} />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Ver detalhes</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
          ))}
        </tbody>
      </table>
      </div>
    </div>
  )
}
