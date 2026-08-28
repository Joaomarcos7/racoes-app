"use client"
import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { formatCurrency } from "@/lib/utils"
import { formatMoneyInput, parseMaskedMoney } from "@/lib/money-mask"
import { validarBaixaFiado, validarDistribuicaoLote, normalizarMetodosPagamento } from "@/lib/pedido-utils"
import type { ClienteFiadoHub } from "@/hooks/use-fiado"

const METODOS = [
  { value: "DINHEIRO", label: "Dinheiro" },
  { value: "PIX", label: "Pix" },
  { value: "PIX_TERCEIROS", label: "Pix Terceiros" },
  { value: "BOLETO", label: "Boleto" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "CARTAO_CREDITO", label: "Cartão de Crédito" },
  { value: "CARTAO_DEBITO", label: "Cartão de Débito" },
]

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  clientes: ClienteFiadoHub[]
  loading?: boolean
  onSubmit: (pagamentos: { pedidoId: string; valor: number; metodoPagamento: string }[]) => void
}

export function BaixaLoteDialog({ open, onOpenChange, clientes, loading, onSubmit }: Props) {
  const [totalRecebido, setTotalRecebido] = useState("")
  const [modo, setModo] = useState<"global" | "individual">("global")
  const [metodoGlobal, setMetodoGlobal] = useState("")
  const [metodoPorPedido, setMetodoPorPedido] = useState<Record<string, string>>({})
  const [selecionados, setSelecionados] = useState<Record<string, boolean>>({})
  const [valores, setValores] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<string[]>([])

  function reset() {
    setTotalRecebido("")
    setModo("global")
    setMetodoGlobal("")
    setMetodoPorPedido({})
    setSelecionados({})
    setValores({})
    setErrors([])
  }

  function togglePedido(pedidoId: string, valorEmAberto: number, checked: boolean) {
    setSelecionados((prev) => ({ ...prev, [pedidoId]: checked }))
    if (checked && !valores[pedidoId]) {
      setValores((prev) => ({ ...prev, [pedidoId]: formatMoneyInput(String(valorEmAberto)) }))
    }
  }

  function handleValorChange(pedidoId: string, raw: string) {
    setValores((prev) => ({ ...prev, [pedidoId]: formatMoneyInput(raw) }))
  }

  const pedidosSelecionados = useMemo(() => {
    return clientes.flatMap((c) =>
      c.pedidosFiado.filter((p) => selecionados[p.id]).map((p) => ({ ...p, clienteId: c.id }))
    )
  }, [clientes, selecionados])

  const totalAlocado = useMemo(
    () => pedidosSelecionados.reduce((acc, p) => acc + parseMaskedMoney(valores[p.id] ?? ""), 0),
    [pedidosSelecionados, valores]
  )

  const totalRecebidoNum = parseMaskedMoney(totalRecebido)
  const restante = totalRecebidoNum - totalAlocado

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const erros: string[] = []

    const alocacoes = pedidosSelecionados.map((p) => ({ valor: parseMaskedMoney(valores[p.id] ?? "") }))
    const erroDistribuicao = validarDistribuicaoLote(totalRecebidoNum, alocacoes)
    if (erroDistribuicao) erros.push(erroDistribuicao)

    for (const pedido of pedidosSelecionados) {
      const valor = parseMaskedMoney(valores[pedido.id] ?? "")
      const err = validarBaixaFiado(valor, pedido.valorEmAbertoFiado ?? 0)
      if (err) erros.push(`Pedido ${new Date(pedido.dataPedido).toLocaleDateString("pt-BR")}: ${err}`)
    }

    if (modo === "global" && !metodoGlobal) erros.push("Selecione o método de pagamento")
    if (modo === "individual") {
      const semMetodo = pedidosSelecionados.filter((p) => !metodoPorPedido[p.id])
      if (semMetodo.length > 0) erros.push("Selecione o método de pagamento para todos os pedidos")
    }

    if (erros.length > 0) { setErrors(erros); return }

    const pagamentosBase = pedidosSelecionados.map((p) => ({
      pedidoId: p.id,
      valor: parseMaskedMoney(valores[p.id] ?? ""),
    }))
    const pagamentos = normalizarMetodosPagamento(pagamentosBase, modo, metodoGlobal, metodoPorPedido)
    onSubmit(pagamentos)
  }

  const podeFinalizar = !loading && pedidosSelecionados.length > 0 && totalRecebidoNum > 0

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Dar Baixa em Lote</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-hidden">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Valor Recebido *</Label>
              <Input
                inputMode="numeric"
                placeholder="0,00"
                value={totalRecebido}
                onChange={(e) => setTotalRecebido(formatMoneyInput(e.target.value))}
                className="text-right"
              />
            </div>
            <div className="space-y-1">
              <Label className="invisible">.</Label>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-sm text-gray-500">Alocado:</span>
                <span className={`text-sm font-semibold ${restante < -0.005 ? "text-red-600" : "text-gray-800"}`}>
                  {formatCurrency(totalAlocado)}
                </span>
                {totalRecebidoNum > 0 && (
                  <span className={`text-xs ${restante < -0.005 ? "text-red-500" : "text-gray-400"}`}>
                    (restante: {formatCurrency(Math.max(0, restante))})
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Método:</span>
            <button
              type="button"
              onClick={() => setModo("global")}
              className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${modo === "global" ? "bg-orange-600 text-white border-orange-600" : "border-gray-300 text-gray-500 hover:border-gray-400"}`}
            >
              Mesmo para todos
            </button>
            <button
              type="button"
              onClick={() => setModo("individual")}
              className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${modo === "individual" ? "bg-orange-600 text-white border-orange-600" : "border-gray-300 text-gray-500 hover:border-gray-400"}`}
            >
              Por pedido
            </button>
          </div>

          {modo === "global" && (
            <div className="space-y-1">
              <Label>Método de Pagamento *</Label>
              <Select value={metodoGlobal} onValueChange={setMetodoGlobal}>
                <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                <SelectContent>
                  {METODOS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="overflow-y-auto flex-1 min-h-0 border rounded-md divide-y">
            {clientes.map((cliente) => (
              <div key={cliente.id}>
                <div className="px-3 py-2 bg-gray-50 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">{cliente.nome}</span>
                  <span className="text-xs text-orange-600 font-medium">{formatCurrency(cliente.totalFiado)}</span>
                </div>
                <div className="divide-y">
                  {cliente.pedidosFiado.map((pedido) => (
                    <div key={pedido.id} className="px-3 py-2 space-y-2">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={`pedido-${pedido.id}`}
                          checked={!!selecionados[pedido.id]}
                          onCheckedChange={(checked) => togglePedido(pedido.id, pedido.valorEmAbertoFiado ?? 0, !!checked)}
                        />
                        <label htmlFor={`pedido-${pedido.id}`} className="flex-1 cursor-pointer">
                          <span className="text-sm text-gray-800">
                            {new Date(pedido.dataPedido).toLocaleDateString("pt-BR")}
                          </span>
                          <span className="text-xs text-amber-700 ml-2">
                            em aberto: {formatCurrency(pedido.valorEmAbertoFiado ?? 0)}
                          </span>
                        </label>
                        {selecionados[pedido.id] && (
                          <Input
                            inputMode="numeric"
                            placeholder="0,00"
                            value={valores[pedido.id] ?? ""}
                            onChange={(e) => handleValorChange(pedido.id, e.target.value)}
                            className="w-28 text-right h-7 text-sm"
                          />
                        )}
                      </div>
                      {selecionados[pedido.id] && modo === "individual" && (
                        <div className="pl-7">
                          <Select
                            value={metodoPorPedido[pedido.id] ?? ""}
                            onValueChange={(v) => setMetodoPorPedido((prev) => ({ ...prev, [pedido.id]: v }))}
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue placeholder="Método..." />
                            </SelectTrigger>
                            <SelectContent>
                              {METODOS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {errors.length > 0 && (
            <div className="space-y-1">
              {errors.map((err, i) => (
                <p key={i} className="text-xs text-red-600">{err}</p>
              ))}
            </div>
          )}

          <div className="flex gap-2 justify-between items-center">
            <span className="text-sm text-gray-500">
              {pedidosSelecionados.length} pedido{pedidosSelecionados.length !== 1 ? "s" : ""} selecionado{pedidosSelecionados.length !== 1 ? "s" : ""}
            </span>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button
                type="submit"
                className="bg-orange-600 hover:bg-orange-500"
                disabled={!podeFinalizar}
              >
                {loading ? "Salvando..." : "Registrar Baixa em Lote"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
