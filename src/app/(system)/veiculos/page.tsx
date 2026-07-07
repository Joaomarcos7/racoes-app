"use client"
import { useState } from "react"
import { PageHeader } from "@/components/layout/PageHeader"
import { VeiculoTable } from "@/components/veiculos/VeiculoTable"
import { VeiculoForm } from "@/components/veiculos/VeiculoForm"
import { useVeiculos, useCreateVeiculo, useUpdateVeiculo, useDeleteVeiculo } from "@/hooks/use-veiculos"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Pagination } from "@/components/ui/Pagination"
import type { VeiculoDTO, TipoCarroceria } from "@/types/api"

export default function VeiculosPage() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(15)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<VeiculoDTO | null>(null)
  const { data: result, isLoading } = useVeiculos(page, limit)
  const createMutation = useCreateVeiculo()
  const updateMutation = useUpdateVeiculo()
  const deleteMutation = useDeleteVeiculo()

  function handleSubmit(data: { placa: string; modelo: string; ano: number; carroceria: TipoCarroceria; cor: string; pesoMaximo: number }) {
    if (editing) {
      updateMutation.mutate({ id: editing.id, ...data }, { onSuccess: () => setOpen(false) })
    } else {
      createMutation.mutate(data, { onSuccess: () => setOpen(false) })
    }
  }

  return (
    <div>
      <PageHeader
        title="Veículos"
        action={
          <Button
            className="bg-blue-700 hover:bg-blue-600"
            onClick={() => { setEditing(null); setOpen(true) }}
          >
            + Novo Veículo
          </Button>
        }
      />
      {isLoading ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : (
        <>
          <VeiculoTable
            veiculos={result?.data ?? []}
            onEdit={(v) => { setEditing(v); setOpen(true) }}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Veículo" : "Novo Veículo"}</DialogTitle>
          </DialogHeader>
          <VeiculoForm
            initial={editing ?? undefined}
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
            loading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
