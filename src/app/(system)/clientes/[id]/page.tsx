"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import { PageHeader } from "@/components/layout/PageHeader"
import { ClienteForm } from "@/components/clientes/ClienteForm"
import { ClienteHistorico } from "@/components/clientes/ClienteHistorico"
import { BaixaFiadoDialog } from "@/components/clientes/BaixaFiadoDialog"
import { useCliente, useUpdateCliente, useDarBaixaFiado } from "@/hooks/use-clientes"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/utils"
import type { PedidoDTO } from "@/types/api"

export default function ClienteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: cliente, isLoading } = useCliente(id)
  const updateMutation = useUpdateCliente()
  const baixaMutation = useDarBaixaFiado(id)
  const [editOpen, setEditOpen] = useState(false)
  const [baixaOpen, setBaixaOpen] = useState(false)

  if (isLoading) return <p className="text-sm text-gray-500">Carregando...</p>
  if (!cliente) return <p className="text-sm text-red-500">Cliente não encontrado.</p>

  const pedidosFiado = (cliente.pedidos ?? []).filter((p) => p.statusPagamento === "FIADO" && (p.valorEmAbertoFiado ?? 0) > 0) as PedidoDTO[]
  const temFiado = pedidosFiado.length > 0
  const totalFiado = pedidosFiado.reduce((acc, p) => acc + (p.valorEmAbertoFiado ?? 0), 0)

  return (
    <div>
      <PageHeader
        title={cliente.nome}
        description={`${cliente.cidade}${cliente.telefone ? ` • ${cliente.telefone}` : ""}`}
        action={
          <div className="flex gap-2 items-center">
            {temFiado && (
              <>
                <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                  Fiado: {formatCurrency(totalFiado)}
                </Badge>
                <Button size="sm" className="bg-orange-600 hover:bg-orange-500" onClick={() => setBaixaOpen(true)}>
                  Dar Baixa
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              Editar
            </Button>
          </div>
        }
      />
      {(cliente.telefone || cliente.instituicao || cliente.cep || cliente.endereco || cliente.complemento) && (
        <div className="bg-white rounded-lg border p-6 mb-4">
          <h2 className="font-semibold mb-3 text-gray-700">Informações</h2>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {cliente.telefone && (
              <>
                <dt className="text-gray-500">Telefone</dt>
                <dd className="text-gray-900">{cliente.telefone}</dd>
              </>
            )}
            {cliente.instituicao && (
              <>
                <dt className="text-gray-500">Instituição</dt>
                <dd className="text-gray-900">{cliente.instituicao}</dd>
              </>
            )}
            {cliente.cep && (
              <>
                <dt className="text-gray-500">CEP</dt>
                <dd className="text-gray-900">{cliente.cep}</dd>
              </>
            )}
            {cliente.endereco && (
              <>
                <dt className="text-gray-500">Endereço</dt>
                <dd className="text-gray-900">{cliente.endereco}</dd>
              </>
            )}
            {cliente.complemento && (
              <>
                <dt className="text-gray-500">Complemento</dt>
                <dd className="text-gray-900">{cliente.complemento}</dd>
              </>
            )}
          </dl>
        </div>
      )}
      {temFiado && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-amber-800">Fiado em Aberto</h2>
            <span className="text-lg font-bold text-amber-900">{formatCurrency(totalFiado)}</span>
          </div>
          <div className="rounded-md border border-amber-200 bg-white divide-y">
            {pedidosFiado.map((p) => (
              <div key={p.id} className="px-4 py-2 flex justify-between text-sm">
                <span className="text-gray-600">{new Date(p.dataPedido).toLocaleDateString("pt-BR")}</span>
                <span className="font-medium text-amber-800">{formatCurrency(p.valorEmAbertoFiado ?? 0)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="font-semibold mb-3 text-gray-700">Histórico de Pedidos</h2>
        <ClienteHistorico pedidos={cliente.pedidos ?? []} />
      </div>
      <BaixaFiadoDialog
        open={baixaOpen}
        onOpenChange={setBaixaOpen}
        pedidosFiado={pedidosFiado}
        loading={baixaMutation.isPending}
        onSubmit={(data) => baixaMutation.mutate(data, { onSuccess: () => setBaixaOpen(false) })}
      />
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          <ClienteForm
            initial={cliente}
            onSubmit={(data) =>
              updateMutation.mutate(
                { id, ...data },
                { onSuccess: () => setEditOpen(false) }
              )
            }
            onCancel={() => setEditOpen(false)}
            loading={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
