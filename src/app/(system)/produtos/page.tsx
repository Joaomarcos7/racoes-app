"use client"
import { useState } from "react"
import { PageHeader } from "@/components/layout/PageHeader"
import { ProdutoTable } from "@/components/produtos/ProdutoTable"
import { ProdutoForm } from "@/components/produtos/ProdutoForm"
import { useProdutos, useCreateProduto, useUpdateProduto, useDeleteProduto } from "@/hooks/use-produtos"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Pagination } from "@/components/ui/Pagination"
import type { ProdutoDTO } from "@/types/api"

export default function ProdutosPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(15)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ProdutoDTO | null>(null)

  const { data: result, isLoading } = useProdutos(search, page, limit)
  const createMutation = useCreateProduto()
  const updateMutation = useUpdateProduto()
  const deleteMutation = useDeleteProduto()

  function openCreate() { setEditing(null); setOpen(true) }
  function openEdit(p: ProdutoDTO) { setEditing(p); setOpen(true) }

  function handleSubmit(data: { nome: string; peso: number; valorUnitario: number }) {
    if (editing) {
      updateMutation.mutate({ id: editing.id, ...data }, { onSuccess: () => setOpen(false) })
    } else {
      createMutation.mutate(data, { onSuccess: () => setOpen(false) })
    }
  }

  return (
    <div>
      <PageHeader
        title="Produtos"
        description="Catálogo de produtos da loja"
        action={
          <Button className="bg-blue-700 hover:bg-blue-600" onClick={openCreate}>
            + Novo Produto
          </Button>
        }
      />
      <div className="mb-4">
        <Input
          placeholder="Buscar produto..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="max-w-sm"
        />
      </div>
      {isLoading ? (
        <p className="text-gray-500 text-sm">Carregando...</p>
      ) : (
        <>
          <ProdutoTable
            produtos={result?.data ?? []}
            onEdit={openEdit}
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
            <DialogTitle>{editing ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          </DialogHeader>
          <ProdutoForm
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
