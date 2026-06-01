"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import type { ProdutoDTO } from "@/types/api"
import { Pencil, Trash2 } from "lucide-react"

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
      <table className="w-full text-sm">
        <thead className="bg-[#0C5E3A] text-white">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Nome</th>
            <th className="px-4 py-3 text-right font-medium">Peso (kg)</th>
            <th className="px-4 py-3 text-right font-medium">Valor Unit.</th>
            <th className="px-4 py-3 text-center font-medium">Status</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((p, i) => (
            <tr key={p.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-4 py-3 font-medium">{p.nome}</td>
              <td className="px-4 py-3 text-right">{p.peso}</td>
              <td className="px-4 py-3 text-right">{formatCurrency(p.valorUnitario)}</td>
              <td className="px-4 py-3 text-center">
                <Badge variant={p.ativo ? "default" : "secondary"}>
                  {p.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex gap-1 justify-end">
                  <Button size="icon" variant="ghost" onClick={() => onEdit(p)}>
                    <Pencil size={14} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => onDelete(p.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
