"use client"
import { useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/layout/PageHeader"
import { ClienteTable } from "@/components/clientes/ClienteTable"
import { useClientes, useDeleteCliente } from "@/hooks/use-clientes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination } from "@/components/ui/Pagination"
import { ArrowUpDown } from "lucide-react"

export default function ClientesPage() {
  const [search, setSearch] = useState("")
  const [cidade, setCidade] = useState("")
  const [sortBy, setSortBy] = useState<"nome" | "cidade">("nome")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(15)
  const { data: result, isLoading } = useClientes({ search, cidade, sortBy, sortDir, page, limit })
  const deleteMutation = useDeleteCliente()

  function resetPage() { setPage(1) }

  function toggleSort(campo: "nome" | "cidade") {
    if (sortBy === campo) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(campo)
      setSortDir("asc")
    }
    resetPage()
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
      <div className="flex flex-wrap gap-2 mb-4">
        <Input
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); resetPage() }}
          className="w-full sm:max-w-xs"
        />
        <Input
          placeholder="Filtrar por cidade..."
          value={cidade}
          onChange={(e) => { setCidade(e.target.value); resetPage() }}
          className="w-full sm:max-w-xs"
        />
        <Select value={`${sortBy}-${sortDir}`} onValueChange={(v) => { const [f, d] = v.split("-") as ["nome" | "cidade", "asc" | "desc"]; setSortBy(f); setSortDir(d); resetPage() }}>
          <SelectTrigger className="w-full sm:w-48">
            <ArrowUpDown size={14} className="mr-1.5 text-gray-400" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nome-asc">Nome A→Z</SelectItem>
            <SelectItem value="nome-desc">Nome Z→A</SelectItem>
            <SelectItem value="cidade-asc">Cidade A→Z</SelectItem>
            <SelectItem value="cidade-desc">Cidade Z→A</SelectItem>
          </SelectContent>
        </Select>
        {(search || cidade) && (
          <Button variant="outline" size="sm" onClick={() => { setSearch(""); setCidade(""); resetPage() }}>
            Limpar filtros
          </Button>
        )}
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
