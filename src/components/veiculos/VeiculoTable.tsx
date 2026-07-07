"use client"
import { Button } from "@/components/ui/button"
import type { VeiculoDTO } from "@/types/api"
import { Pencil, Trash2 } from "lucide-react"
import { ConfirmDeleteDialog } from "@/components/ui/ConfirmDeleteDialog"
import { labelCarroceria } from "@/lib/veiculo-utils"

interface VeiculoTableProps {
  veiculos: VeiculoDTO[]
  onEdit: (v: VeiculoDTO) => void
  onDelete: (id: string) => void
}

export function VeiculoTable({ veiculos, onEdit, onDelete }: VeiculoTableProps) {
  if (veiculos.length === 0) {
    return <p className="text-sm text-gray-500 py-4">Nenhum veículo cadastrado.</p>
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
      <table className="min-w-full min-w-[640px] text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Placa</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Modelo</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Ano</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Carroceria</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Cor</th>
            <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Peso Máx.</th>
            <th className="px-3 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {veiculos.map((v, i) => (
            <tr key={v.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-3 py-3 font-mono font-medium whitespace-nowrap">{v.placa}</td>
              <td className="px-3 py-3">{v.modelo}</td>
              <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{v.ano}</td>
              <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{labelCarroceria(v.carroceria)}</td>
              <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{v.cor}</td>
              <td className="px-3 py-3 text-right whitespace-nowrap">{v.pesoMaximo} kg</td>
              <td className="px-3 py-3 text-right whitespace-nowrap">
                <div className="flex gap-1 justify-end">
                  <Button size="icon" variant="ghost" onClick={() => onEdit(v)}>
                    <Pencil size={14} />
                  </Button>
                  <ConfirmDeleteDialog onConfirm={() => onDelete(v.id)}>
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
