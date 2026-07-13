"use client"
import { useParams, useRouter } from "next/navigation"
import { PageHeader } from "@/components/layout/PageHeader"
import { SaidaForm } from "@/components/saidas/SaidaForm"
import { useSaida, useUpdateSaida, useDeleteSaida } from "@/hooks/use-saidas"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { labelTipoSaida } from "@/lib/saida-utils"
import { Trash2 } from "lucide-react"
import { ConfirmDeleteDialog } from "@/components/ui/ConfirmDeleteDialog"

export default function SaidaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: saida, isLoading } = useSaida(id)
  const updateMutation = useUpdateSaida()
  const deleteMutation = useDeleteSaida()

  if (isLoading) return <p className="text-sm text-gray-500">Carregando...</p>
  if (!saida) return <p className="text-sm text-red-500">Saída não encontrada.</p>

  return (
    <div className="max-w-xl space-y-4">
      <PageHeader
        title="Detalhe da Saída"
        description={new Date(saida.data).toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" })}
        action={
          <ConfirmDeleteDialog
            onConfirm={() => deleteMutation.mutate(id, { onSuccess: () => router.push("/saidas") })}
            description="Esta saída será excluída permanentemente."
          >
            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" disabled={deleteMutation.isPending}>
              <Trash2 size={14} className="mr-1.5" />
              Excluir
            </Button>
          </ConfirmDeleteDialog>
        }
      />
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div className="flex gap-3 flex-wrap">
          <Badge className="bg-orange-100 text-orange-700">{labelTipoSaida(saida.tipo)}</Badge>
          <span className="text-xl font-bold text-red-700">{formatCurrency(saida.valor)}</span>
        </div>
        {saida.descricao && (
          <p className="text-sm text-gray-600">{saida.descricao}</p>
        )}
        <hr />
        <h3 className="font-semibold text-gray-700 text-sm">Editar Saída</h3>
        <SaidaForm
          initial={saida}
          onSubmit={(data) => updateMutation.mutate({ id, data: data.data, tipo: data.tipo as never, descricao: data.descricao, valor: data.valor })}
          onCancel={() => router.push("/saidas")}
          loading={updateMutation.isPending}
        />
      </div>
    </div>
  )
}
