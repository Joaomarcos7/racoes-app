"use client"
import { useState } from "react"
import { PageHeader } from "@/components/layout/PageHeader"
import { VeiculoTable } from "@/components/veiculos/VeiculoTable"
import { VeiculoForm } from "@/components/veiculos/VeiculoForm"
import { useVeiculos, useCreateVeiculo, useUpdateVeiculo } from "@/hooks/use-veiculos"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { VeiculoDTO } from "@/types/api"

export default function VeiculosPage() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<VeiculoDTO | null>(null)
  const { data: veiculos = [], isLoading } = useVeiculos()
  const createMutation = useCreateVeiculo()
  const updateMutation = useUpdateVeiculo()

  function handleSubmit(data: { placa: string; modelo: string; pesoMaximo: number }) {
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
            className="bg-green-800 hover:bg-green-700"
            onClick={() => { setEditing(null); setOpen(true) }}
          >
            + Novo Veículo
          </Button>
        }
      />
      {isLoading ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : (
        <VeiculoTable
          veiculos={veiculos}
          onEdit={(v) => { setEditing(v); setOpen(true) }}
        />
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
