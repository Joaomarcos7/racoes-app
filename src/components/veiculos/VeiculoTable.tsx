"use client"
import { Button } from "@/components/ui/button"
import type { VeiculoDTO } from "@/types/api"
import { Pencil } from "lucide-react"

interface VeiculoTableProps {
  veiculos: VeiculoDTO[]
  onEdit: (v: VeiculoDTO) => void
}

export function VeiculoTable({ veiculos, onEdit }: VeiculoTableProps) {
  if (veiculos.length === 0) {
    return <p className="text-sm text-gray-500 py-4">Nenhum veículo cadastrado.</p>
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-[#0C5E3A] text-white">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Placa</th>
            <th className="px-4 py-3 text-left font-medium">Modelo</th>
            <th className="px-4 py-3 text-right font-medium">Peso Máx. (kg)</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {veiculos.map((v, i) => (
            <tr key={v.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-4 py-3 font-mono font-medium">{v.placa}</td>
              <td className="px-4 py-3">{v.modelo}</td>
              <td className="px-4 py-3 text-right">{v.pesoMaximo} kg</td>
              <td className="px-4 py-3 text-right">
                <Button size="icon" variant="ghost" onClick={() => onEdit(v)}>
                  <Pencil size={14} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
