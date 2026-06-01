"use client"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/layout/PageHeader"
import { PedidoForm } from "@/components/pedidos/PedidoForm"
import { useCreatePedido } from "@/hooks/use-pedidos"

export default function NovoPedidoPage() {
  const router = useRouter()
  const mutation = useCreatePedido()
  return (
    <div className="max-w-2xl">
      <PageHeader title="Novo Pedido" />
      <div className="bg-white rounded-lg border p-6">
        <PedidoForm
          onSubmit={(data) => mutation.mutate(data, { onSuccess: (p) => router.push(`/pedidos/${p.id}`) })}
          onCancel={() => router.back()}
          loading={mutation.isPending}
        />
      </div>
    </div>
  )
}
