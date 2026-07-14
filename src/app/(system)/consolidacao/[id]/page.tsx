"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import { PageHeader } from "@/components/layout/PageHeader"
import { PainelPedidos } from "@/components/consolidacao/PainelPedidos"
import { PainelVeiculos } from "@/components/consolidacao/PainelVeiculos"
import { useConsolidacao, useAlocarPedido, useDesalocarPedido, useFecharRota, useReabrirRota, useRegistrarFalta, PesoExcedidoError } from "@/hooks/use-consolidacao"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { Printer } from "lucide-react"
import type { PedidoDTO } from "@/types/api"

export default function ConsolidacaoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading } = useConsolidacao(id)
  const alocarMutation = useAlocarPedido(id)
  const desalocarMutation = useDesalocarPedido(id)
  const fecharMutation = useFecharRota(id)
  const reabrirMutation = useReabrirRota(id)
  const faltaMutation = useRegistrarFalta(id)
  const [loadingPedidoId, setLoadingPedidoId] = useState<string | undefined>()

  if (isLoading) return <p className="text-sm text-gray-500">Carregando...</p>
  if (!data) return <p className="text-sm text-red-500">Rota não encontrada.</p>

  const isFechada = data.status === "FECHADA"

  async function handleAlocar(pedidoId: string, force = false) {
    setLoadingPedidoId(pedidoId)
    try {
      await alocarMutation.mutateAsync({ pedidoId, force })
    } catch (err) {
      if (err instanceof PesoExcedidoError) {
        const confirmado = window.confirm(
          `⚠️ Peso máximo do veículo ultrapassado em ${err.excesso.toFixed(1)} kg.\n\nDeseja alocar o pedido mesmo assim?`
        )
        if (confirmado) await handleAlocar(pedidoId, true)
      } else {
        toast.error(err instanceof Error ? err.message : "Erro ao alocar pedido")
      }
    } finally {
      setLoadingPedidoId(undefined)
    }
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
            {isFechada && (
              <Button variant="outline" size="sm" onClick={() => window.open(`/consolidacao/${id}/print`, "_blank")}>
                <Printer size={14} className="mr-1.5" />
                Imprimir Cupom
              </Button>
            )}
            <Badge className={isFechada ? "bg-blue-100 text-blue-700" : "bg-blue-100 text-blue-700"}>
              {isFechada ? "Fechada" : "Aberta"}
            </Badge>
            {isFechada ? (
              <Button variant="outline" className="border-amber-500 text-amber-700 hover:bg-amber-50" disabled={reabrirMutation.isPending} onClick={() => reabrirMutation.mutate()}>
                {reabrirMutation.isPending ? "Reabrindo..." : "Reabrir Rota"}
              </Button>
            ) : (
              <Button className="bg-blue-700 hover:bg-blue-600" disabled={data.itens.length === 0 || fecharMutation.isPending} onClick={() => fecharMutation.mutate()}>
                {fecharMutation.isPending ? "Fechando..." : "Fechar Rota"}
              </Button>
            )}
          </div>
        }
      />
      {isFechada ? (
        <div style={{ height: "calc(100vh - 200px)" }}>
          <PainelVeiculos rota={data} isFechada loadingId={loadingPedidoId} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4" style={{ height: "calc(100vh - 200px)" }}>
          <PainelPedidos
            pedidos={(data.pedidosDisponiveis ?? []) as PedidoDTO[]}
            onAlocar={handleAlocar}
            loadingId={loadingPedidoId}
          />
          <PainelVeiculos
            rota={data}
            onDesalocar={handleDesalocar}
            onRegistrarFalta={(pedidoId, faltas) => faltaMutation.mutate({ pedidoId, faltas })}
            loadingId={loadingPedidoId}
          />
        </div>
      )}
    </div>
  )
}
