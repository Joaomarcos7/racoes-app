"use client"
import { useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/layout/PageHeader"
import { useSaidas, useDeleteSaida } from "@/hooks/use-saidas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Pagination } from "@/components/ui/Pagination"
import { formatCurrency, formatDate } from "@/lib/utils"
import { labelTipoSaida, TIPOS_SAIDA } from "@/lib/saida-utils"
import { Trash2, Pencil } from "lucide-react"

export default function SaidasPage() {
  const [dataInicio, setDataInicio] = useState("")
  const [dataFim, setDataFim] = useState("")
  const [tipo, setTipo] = useState("all")
  const [page, setPage] = useState(1)
  const limit = 20
  const deleteMutation = useDeleteSaida()

  const { data: result, isLoading } = useSaidas({ dataInicio, dataFim, tipo, page, limit })

  function resetPage() { setPage(1) }

  const totalValor = result?.data.reduce((acc, s) => acc + s.valor, 0) ?? 0

  return (
    <div>
      <PageHeader
        title="Saídas"
        action={
          <Button className="bg-blue-700 hover:bg-blue-600" asChild>
            <Link href="/saidas/novo">+ Nova Saída</Link>
          </Button>
        }
      />
      <div className="flex flex-wrap gap-2 mb-4">
        <Input
          type="date"
          value={dataInicio}
          onChange={(e) => { setDataInicio(e.target.value); resetPage() }}
          className="w-full sm:w-auto"
          placeholder="Data início"
        />
        <Input
          type="date"
          value={dataFim}
          onChange={(e) => { setDataFim(e.target.value); resetPage() }}
          className="w-full sm:w-auto"
          placeholder="Data fim"
        />
        <Select value={tipo} onValueChange={(v) => { setTipo(v); resetPage() }}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Tipo: todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {TIPOS_SAIDA.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(dataInicio || dataFim || tipo !== "all") && (
          <Button variant="outline" size="sm" onClick={() => { setDataInicio(""); setDataFim(""); setTipo("all"); resetPage() }}>
            Limpar filtros
          </Button>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <th className="text-left px-4 py-3">Data</th>
                  <th className="text-left px-4 py-3">Tipo</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Descrição</th>
                  <th className="text-right px-4 py-3">Valor</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {result?.data.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">Nenhuma saída encontrada</td></tr>
                )}
                {result?.data.map((s) => (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link href={`/saidas/${s.id}`} className="text-blue-700 hover:underline font-medium">
                        {new Date(s.data).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className="bg-orange-100 text-orange-700 font-medium">{labelTipoSaida(s.tipo)}</Badge>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-500">
                      {s.descricao ?? <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-red-700">
                      {formatCurrency(s.valor)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                          <Link href={`/saidas/${s.id}`}><Pencil size={13} /></Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-600 hover:text-red-700"
                          disabled={deleteMutation.isPending}
                          onClick={() => { if (confirm("Excluir esta saída?")) deleteMutation.mutate(s.id) }}
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              {result && result.data.length > 0 && (
                <tfoot>
                  <tr className="border-t bg-gray-50">
                    <td colSpan={3} className="px-4 py-2 text-xs text-gray-500">
                      {result.total} registro{result.total !== 1 ? "s" : ""}
                    </td>
                    <td className="px-4 py-2 text-right font-semibold text-red-700">
                      {formatCurrency(totalValor)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
          {result && result.totalPages > 1 && (
            <Pagination page={page} totalPages={result.totalPages} total={result.total} limit={limit} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  )
}
