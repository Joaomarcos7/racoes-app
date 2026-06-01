"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { pdf } from "@react-pdf/renderer"
import { DashboardPDF } from "./DashboardPDF"
import type { DashboardKPIsDTO } from "@/types/api"
import * as XLSX from "xlsx"
import { formatDate } from "@/lib/utils"
import { Download } from "lucide-react"

export function ExportButton({ data, periodo }: { data: DashboardKPIsDTO; periodo: string }) {
  const [loadingPdf, setLoadingPdf] = useState(false)

  async function handleExportPDF() {
    setLoadingPdf(true)
    try {
      const blob = await pdf(<DashboardPDF data={data} periodo={periodo} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `dashboard-${periodo}-${new Date().toISOString().slice(0, 10)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setLoadingPdf(false)
    }
  }

  function handleExportExcel() {
    const rows = (data.ultimosPedidos as (typeof data.ultimosPedidos[0] & { total?: number })[]).map((p) => ({
      Cliente: p.cliente?.nome ?? "",
      Cidade: p.cliente?.cidade ?? "",
      Data: formatDate(p.dataPedido),
      Total: p.total ?? 0,
      StatusEntrega: p.statusEntrega,
      StatusPagamento: p.statusPagamento,
      MetodoPagamento: p.metodoPagamento ?? "",
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Pedidos")
    XLSX.writeFile(wb, `dashboard-${periodo}-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={loadingPdf}>
        <Download size={14} className="mr-1" />{loadingPdf ? "Gerando..." : "PDF"}
      </Button>
      <Button variant="outline" size="sm" onClick={handleExportExcel}>
        <Download size={14} className="mr-1" />Excel
      </Button>
    </div>
  )
}
