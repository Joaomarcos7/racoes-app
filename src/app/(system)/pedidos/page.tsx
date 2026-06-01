"use client"
import { useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/layout/PageHeader"
import { PedidoTable } from "@/components/pedidos/PedidoTable"
import { usePedidos } from "@/hooks/use-pedidos"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function PedidosPage() {
  const [search, setSearch] = useState("")
  const [statusEntrega, setStatusEntrega] = useState("")
  const [statusPagamento, setStatusPagamento] = useState("")
  const { data: pedidos = [], isLoading } = usePedidos({ search, statusEntrega, statusPagamento })

  return (
    <div>
      <PageHeader
        title="Pedidos"
        action={
          <Button className="bg-green-800 hover:bg-green-700" asChild>
            <Link href="/pedidos/novo">+ Novo Pedido</Link>
          </Button>
        }
      />
      <div className="flex gap-3 mb-4 flex-wrap">
        <Input placeholder="Buscar por cliente..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={statusEntrega} onValueChange={setStatusEntrega}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Entrega: todos" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="AGUARDANDO">Aguardando</SelectItem>
            <SelectItem value="EM_ROTA">Em Rota</SelectItem>
            <SelectItem value="ENTREGUE">Entregue</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusPagamento} onValueChange={setStatusPagamento}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Pagamento: todos" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="PENDENTE">Pendente</SelectItem>
            <SelectItem value="PAGO">Pago</SelectItem>
            <SelectItem value="FIADO">Fiado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isLoading ? <p className="text-sm text-gray-500">Carregando...</p> : <PedidoTable pedidos={pedidos} />}
    </div>
  )
}
