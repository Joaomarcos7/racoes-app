"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import { PageHeader } from "@/components/layout/PageHeader"
import { ClienteForm } from "@/components/clientes/ClienteForm"
import { ClienteHistorico } from "@/components/clientes/ClienteHistorico"
import { useCliente, useUpdateCliente } from "@/hooks/use-clientes"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function ClienteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: cliente, isLoading } = useCliente(id)
  const updateMutation = useUpdateCliente()
  const [editOpen, setEditOpen] = useState(false)

  if (isLoading) return <p className="text-sm text-gray-500">Carregando...</p>
  if (!cliente) return <p className="text-sm text-red-500">Cliente não encontrado.</p>

  const temFiado = (cliente.pedidos ?? []).some((p) => p.statusPagamento === "FIADO")

  return (
    <div>
      <PageHeader
        title={cliente.nome}
        description={`${cliente.cidade}${cliente.telefone ? ` • ${cliente.telefone}` : ""}`}
        action={
          <div className="flex gap-2 items-center">
            {temFiado && (
              <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                Possui Fiado
              </Badge>
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
      <div className="bg-white rounded-lg border p-6">
        <h2 className="font-semibold mb-3 text-gray-700">Histórico de Pedidos</h2>
        <ClienteHistorico pedidos={cliente.pedidos ?? []} />
      </div>
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
