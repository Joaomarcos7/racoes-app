"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import { PageHeader } from "@/components/layout/PageHeader"
import { PainelPedidos } from "@/components/consolidacao/PainelPedidos"
import { PainelVeiculos } from "@/components/consolidacao/PainelVeiculos"
import { useConsolidacao, useAlocarPedido, useDesalocarPedido, useFecharRota } from "@/hooks/use-consolidacao"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import type { PedidoDTO } from "@/types/api"

export default function ConsolidacaoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading } = useConsolidacao(id)
  const alocarMutation = useAlocarPedido(id)
  const desalocarMutation = useDesalocarPedido(id)
  const fecharMutation = useFecharRota(id)
  const [loadingPedidoId, setLoadingPedidoId] = useState<string | undefined>()

  if (isLoading) return <p className="text-sm text-gray-500">Carregando...</p>
  if (!data) return <p className="text-sm text-red-500">Rota não encontrada.</p>

  const isFechada = data.status === "FECHADA"

  async function handleAlocar(pedidoId: string) {
    setLoadingPedidoId(pedidoId)
    await alocarMutation.mutateAsync(pedidoId).finally(() => setLoadingPedidoId(undefined))
  }

  async function handleDesalocar(pedidoId: string) {
    setLoadingPedidoId(pedidoId)
    await desalocarMutation.mutateAsync(pedidoId).finally(() => setLoadingPedidoId(undefined))
  }

  return (
    <div>
      <PageHeader
        title={`Rota — ${data.veiculo.placa}`}
        description={`${formatDate(data.data)} · ${data.veiculo.modelo} · ${data.veiculo.pesoMaximo} kg máx`}
        action={
          <div className="flex items-center gap-3">
            <Badge className={isFechada ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}>
              {isFechada ? "Fechada" : "Aberta"}
            </Badge>
            {!isFechada && (
              <Button className="bg-green-800 hover:bg-green-700" disabled={data.itens.length === 0 || fecharMutation.isPending} onClick={() => fecharMutation.mutate()}>
                {fecharMutation.isPending ? "Fechando..." : "Fechar Rota"}
              </Button>
            )}
          </div>
        }
      />
      <div className="grid grid-cols-2 gap-4" style={{ height: "calc(100vh - 200px)" }}>
        <PainelPedidos
          pedidos={isFechada ? [] : ((data.pedidosDisponiveis ?? []) as PedidoDTO[])}
          onAlocar={handleAlocar}
          loadingId={loadingPedidoId}
        />
        <PainelVeiculos rota={data} onDesalocar={handleDesalocar} loadingId={loadingPedidoId} />
      </div>
    </div>
  )
}
