"use client"
import { useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/layout/PageHeader"
import { PedidoTable } from "@/components/pedidos/PedidoTable"
import { usePedidos, useDeletePedido } from "@/hooks/use-pedidos"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination } from "@/components/ui/Pagination"

export default function PedidosPage() {
  const [search, setSearch] = useState("")
  const [tipoPedido, setTipoPedido] = useState("all")
  const [statusEntrega, setStatusEntrega] = useState("all")
  const [statusPagamento, setStatusPagamento] = useState("all")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(15)
  const deleteMutation = useDeletePedido()
  const { data: result, isLoading } = usePedidos({
    search,
    tipoPedido: tipoPedido === "all" ? "" : tipoPedido,
    statusEntrega: statusEntrega === "all" ? "" : statusEntrega,
    statusPagamento: statusPagamento === "all" ? "" : statusPagamento,
    page,
    limit,
  })

  function resetPage() { setPage(1) }

  return (
    <div>
      <PageHeader
        title="Pedidos"
        action={
          <Button className="bg-blue-700 hover:bg-blue-600" asChild>
            <Link href="/pedidos/novo">+ Novo Pedido</Link>
          </Button>
        }
      />
      <div className="flex flex-wrap gap-2 mb-4">
        <Input
          placeholder="Buscar por cliente..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); resetPage() }}
          className="w-full sm:w-auto sm:max-w-xs"
        />
        <Select value={tipoPedido} onValueChange={(v) => { setTipoPedido(v); resetPage() }}>
          <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Tipo: todos" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="ENTREGA">Entrega</SelectItem>
            <SelectItem value="BALCAO">Balcão</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusEntrega} onValueChange={(v) => { setStatusEntrega(v); resetPage() }}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Entrega: todos" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="AGUARDANDO">Aguardando</SelectItem>
            <SelectItem value="EM_ROTA">Em Rota</SelectItem>
            <SelectItem value="ENTREGUE">Entregue</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusPagamento} onValueChange={(v) => { setStatusPagamento(v); resetPage() }}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Pagamento: todos" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="PENDENTE">Pendente</SelectItem>
            <SelectItem value="PAGO">Pago</SelectItem>
            <SelectItem value="FIADO">Fiado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isLoading ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : (
        <>
          <PedidoTable pedidos={result?.data ?? []} onDelete={(id) => deleteMutation.mutate(id)} />
          {result && (
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              total={result.total}
              limit={limit}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />
          )}
        </>
      )}
    </div>
  )
}
