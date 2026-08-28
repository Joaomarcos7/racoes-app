"use client"
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { PageHeader } from "@/components/layout/PageHeader"
import { BaixaFiadoDialog } from "@/components/clientes/BaixaFiadoDialog"
import { useFiado } from "@/hooks/use-fiado"
import { useDarBaixaFiado } from "@/hooks/use-clientes"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import type { PedidoDTO } from "@/types/api"

interface ClienteSelected {
  id: string
  pedidosFiado: PedidoDTO[]
}

export default function FiadoPage() {
  const { data, isLoading } = useFiado()
  const qc = useQueryClient()
  const [selected, setSelected] = useState<ClienteSelected | null>(null)
  const baixaMutation = useDarBaixaFiado(selected?.id ?? "")

  if (isLoading) return <p className="text-sm text-gray-500">Carregando...</p>

  const clientes = data?.clientes ?? []
  const totalGeral = data?.totalGeral ?? 0

  return (
    <div>
      <PageHeader
        title="Fiado em Aberto"
        description={`${clientes.length} cliente${clientes.length !== 1 ? "s" : ""}`}
        action={
          <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-sm px-3 py-1">
            {formatCurrency(totalGeral)}
          </Badge>
        }
      />

      {clientes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <CheckCircle2 size={40} className="text-green-400" />
          <p className="text-sm">Nenhum fiado em aberto</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Cidade</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Telefone</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">Pedidos</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Total devido</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {clientes.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.nome}</td>
                  <td className="px-4 py-3 text-gray-500">{c.cidade}</td>
                  <td className="px-4 py-3 text-gray-500">{c.telefone ?? "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge className="bg-orange-50 text-orange-600 border-orange-200">
                      {c.pedidosFiado.length}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-orange-600">
                    {formatCurrency(c.totalFiado)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      className="bg-orange-600 hover:bg-orange-500"
                      onClick={() => setSelected({ id: c.id, pedidosFiado: c.pedidosFiado })}
                    >
                      Dar Baixa
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <BaixaFiadoDialog
        open={!!selected}
        onOpenChange={(open) => { if (!open) setSelected(null) }}
        pedidosFiado={selected?.pedidosFiado ?? []}
        loading={baixaMutation.isPending}
        onSubmit={(data) =>
          baixaMutation.mutate(data, {
            onSuccess: () => {
              qc.invalidateQueries({ queryKey: ["fiado"] })
              setSelected(null)
            },
          })
        }
      />
    </div>
  )
}
