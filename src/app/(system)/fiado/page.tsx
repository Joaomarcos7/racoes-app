"use client"
import { useState, useMemo } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { PageHeader } from "@/components/layout/PageHeader"
import { BaixaFiadoDialog } from "@/components/clientes/BaixaFiadoDialog"
import { BaixaLoteDialog } from "@/components/fiado/BaixaLoteDialog"
import { Pagination } from "@/components/ui/Pagination"
import { useFiado, useBaixaLote } from "@/hooks/use-fiado"
import { useDarBaixaFiado } from "@/hooks/use-clientes"
import { filtrarClientes, ordenarClientes, paginarClientes } from "@/lib/fiado-utils"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, ArrowUpDown } from "lucide-react"
import type { PedidoDTO } from "@/types/api"

interface ClienteSelected {
  id: string
  pedidosFiado: PedidoDTO[]
}

export default function FiadoPage() {
  const { data, isLoading, isError } = useFiado()
  const qc = useQueryClient()
  const [selected, setSelected] = useState<ClienteSelected | null>(null)
  const [loteOpen, setLoteOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<"nome" | "totalFiado">("totalFiado")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(15)
  const baixaMutation = useDarBaixaFiado(selected?.id ?? "")
  const baixaLoteMutation = useBaixaLote()

  function resetPage() { setPage(1) }

  const clientesFiltrados = useMemo(
    () => filtrarClientes(data?.clientes ?? [], search),
    [data?.clientes, search]
  )
  const clientesOrdenados = useMemo(
    () => ordenarClientes(clientesFiltrados, sortBy, sortDir),
    [clientesFiltrados, sortBy, sortDir]
  )
  const clientesPaginados = useMemo(
    () => paginarClientes(clientesOrdenados, page, limit),
    [clientesOrdenados, page, limit]
  )
  const totalPages = Math.max(1, Math.ceil(clientesOrdenados.length / limit))

  if (isLoading) return <p className="text-sm text-gray-500">Carregando...</p>
  if (isError) return <p className="text-sm text-red-500">Erro ao carregar fiados.</p>

  const totalGeral = data?.totalGeral ?? 0
  const allClientes = data?.clientes ?? []

  return (
    <div>
      <PageHeader
        title="Fiado em Aberto"
        description={`${allClientes.length} cliente${allClientes.length !== 1 ? "s" : ""}`}
        action={
          <div className="flex items-center gap-3">
            {allClientes.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="border-orange-400 text-orange-700 hover:bg-orange-50"
                onClick={() => setLoteOpen(true)}
              >
                Dar Baixa em Lote
              </Button>
            )}
            <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-sm px-3 py-1">
              {formatCurrency(totalGeral)}
            </Badge>
          </div>
        }
      />

      {allClientes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <CheckCircle2 size={40} className="text-green-400" />
          <p className="text-sm">Nenhum fiado em aberto</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            <Input
              placeholder="Buscar por nome do cliente..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetPage() }}
              className="w-full sm:max-w-xs"
            />
            <Select
              value={`${sortBy}-${sortDir}`}
              onValueChange={(v) => {
                const [f, d] = v.split("-") as ["nome" | "totalFiado", "asc" | "desc"]
                setSortBy(f)
                setSortDir(d)
                resetPage()
              }}
            >
              <SelectTrigger className="w-full sm:w-52">
                <ArrowUpDown size={14} className="mr-1.5 text-gray-400" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="totalFiado-desc">Maior valor primeiro</SelectItem>
                <SelectItem value="totalFiado-asc">Menor valor primeiro</SelectItem>
                <SelectItem value="nome-asc">Nome A→Z</SelectItem>
                <SelectItem value="nome-desc">Nome Z→A</SelectItem>
              </SelectContent>
            </Select>
            {search && (
              <Button variant="outline" size="sm" onClick={() => { setSearch(""); resetPage() }}>
                Limpar filtro
              </Button>
            )}
          </div>

          {clientesFiltrados.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">Nenhum cliente encontrado para "{search}".</p>
          ) : (
            <>
              <div className="bg-white rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Cliente</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Cidade</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Telefone</th>
                      <th className="text-center px-4 py-3 font-medium text-gray-500">Pedidos</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500">Total devido</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {clientesPaginados.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{c.nome}</td>
                        <td className="px-4 py-3 text-gray-500">{c.cidade}</td>
                        <td className="px-4 py-3 text-gray-500">{c.telefone ?? "—"}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge className="bg-orange-50 text-orange-600 border-orange-200">
                            {c.pedidosFiado.length}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-orange-600">
                          {formatCurrency(c.totalFiado)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            className="bg-orange-600 hover:bg-orange-500"
                            onClick={() => setSelected({ id: c.id, pedidosFiado: c.pedidosFiado })}
                          >
                            Dar Baixa
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={page}
                totalPages={totalPages}
                total={clientesOrdenados.length}
                limit={limit}
                onPageChange={setPage}
                onLimitChange={(l) => { setLimit(l); resetPage() }}
              />
            </>
          )}
        </>
      )}

      <BaixaFiadoDialog
        open={!!selected}
        onOpenChange={(open) => { if (!open) setSelected(null) }}
        pedidosFiado={selected?.pedidosFiado ?? []}
        loading={baixaMutation.isPending}
        onSubmit={(data) =>
          baixaMutation.mutate(data, {
            onSuccess: () => {
              qc.invalidateQueries({ queryKey: ["fiado"] })
              setSelected(null)
            },
          })
        }
      />

      <BaixaLoteDialog
        open={loteOpen}
        onOpenChange={setLoteOpen}
        clientes={allClientes}
        loading={baixaLoteMutation.isPending}
        onSubmit={(pagamentos) =>
          baixaLoteMutation.mutate(pagamentos, {
            onSuccess: () => setLoteOpen(false),
          })
        }
      />
    </div>
  )
}
