"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/layout/PageHeader"
import { TipoPedidoSelector } from "@/components/pedidos/TipoPedidoSelector"
import { PedidoEntregaForm } from "@/components/pedidos/PedidoEntregaForm"
import { PedidoBalcaoForm } from "@/components/pedidos/PedidoBalcaoForm"
import { useCreatePedido } from "@/hooks/use-pedidos"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function NovoPedidoPage() {
  const router = useRouter()
  const mutation = useCreatePedido()
  const [tipo, setTipo] = useState<"ENTREGA" | "BALCAO" | null>(null)

  const title = tipo === "ENTREGA" ? "Novo Pedido — Entrega" : tipo === "BALCAO" ? "Nova Venda — Balcão" : "Novo Pedido"

  return (
    <div className="max-w-2xl">
      <PageHeader title={title} />
      <div className="bg-white rounded-lg border p-6">
        {!tipo ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Selecione o tipo de pedido:</p>
            <TipoPedidoSelector onSelect={setTipo} />
          </div>
        ) : (
          <div className="space-y-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-gray-500 -ml-1"
              onClick={() => setTipo(null)}
            >
              <ArrowLeft size={14} className="mr-1" /> Voltar
            </Button>
            {tipo === "ENTREGA" ? (
              <PedidoEntregaForm
                onSubmit={(data) => mutation.mutate(data, { onSuccess: (p) => router.push(`/pedidos/${p.id}`) })}
                onCancel={() => router.back()}
                loading={mutation.isPending}
              />
            ) : (
              <PedidoBalcaoForm
                onSubmit={(data) => mutation.mutate(data, { onSuccess: (p) => router.push(`/pedidos/${p.id}`) })}
                onCancel={() => router.back()}
                loading={mutation.isPending}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
