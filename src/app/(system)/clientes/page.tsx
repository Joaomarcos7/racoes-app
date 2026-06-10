"use client"
import { useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/layout/PageHeader"
import { ClienteTable } from "@/components/clientes/ClienteTable"
import { useClientes, useDeleteCliente } from "@/hooks/use-clientes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/Pagination"

export default function ClientesPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(15)
  const { data: result, isLoading } = useClientes(search, page, limit)
  const deleteMutation = useDeleteCliente()

  function handleSearch(value: string) {
    setSearch(value)
    setPage(1)
  }

  return (
    <div>
      <PageHeader
        title="Clientes"
        action={
          <Button className="bg-blue-700 hover:bg-blue-600" asChild>
            <Link href="/clientes/novo">+ Novo Cliente</Link>
          </Button>
        }
      />
      <div className="mb-4">
        <Input
          placeholder="Buscar cliente..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>
      {isLoading ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : (
        <>
          <ClienteTable clientes={result?.data ?? []} onDelete={(id) => deleteMutation.mutate(id)} />
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
