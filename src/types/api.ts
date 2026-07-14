export type TipoSaida =
  | "PAGAMENTO_FUNCIONARIO"
  | "DIESEL"
  | "VIAGEM_MOTORISTA"
  | "OFICINA"
  | "PRODUCAO_TERCEIRIZADA"
  | "DESPACHO_VIAGEM"
  | "OUTRO"

export interface SaidaDTO {
  id: string
  data: string
  tipo: TipoSaida
  descricao: string | null
  valor: number
  createdAt: string
  updatedAt: string
}

export interface SaidasListDTO {
  data: SaidaDTO[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type TipoProduto = "CONSUMIDOR_FINAL" | "ATACADO"

export interface ProdutoDTO {
  id: string
  nome: string
  peso: number
  valorUnitario: number
  custo: number | null
  tipo: TipoProduto
  ativo: boolean
  createdAt: string
}

export interface HistoricoProdutoDTO {
  id: string
  produtoId: string
  precoAnterior: number
  precoNovo: number
  criadoEm: string
}

export interface HistoricoCustoDTO {
  id: string
  produtoId: string
  custoAnterior: number | null
  custoNovo: number | null
  criadoEm: string
}

export interface ProdutoStatsDTO {
  totalPedidos: number
  kgBalcao: number
  kgEntrega: number
  kgTotal: number
  totalUnidades: number
}

export interface ClienteDTO {
  id: string
  nome: string
  telefone: string | null
  instituicao: string | null
  cidade: string
  cep: string | null
  endereco: string | null
  complemento: string | null
  ativo: boolean
  createdAt: string
  temFiado?: boolean
}

export type TipoCarroceria = "BAU" | "GRADE_BAIXA" | "SIDER" | "GRANELEIRO" | "PLATAFORMA" | "FURGAO" | "OUTROS"

export interface VeiculoDTO {
  id: string
  placa: string
  modelo: string
  ano: number
  carroceria: TipoCarroceria
  cor: string
  pesoMaximo: number
  ativo: boolean
}

export type MetodoPagamentoValue = "DINHEIRO" | "PIX" | "PIX_TERCEIROS" | "BOLETO" | "CHEQUE" | "CARTAO_CREDITO" | "CARTAO_DEBITO"

export interface BaixaFiadoDTO {
  id: string
  pedidoId: string
  valor: number
  metodoPagamento: MetodoPagamentoValue
  createdAt: string
}

export interface PagamentoPedidoDTO {
  id: string
  metodo: MetodoPagamentoValue
  valor: number
}

export interface ItemPedidoDTO {
  id: string
  pedidoId: string
  produtoId: string
  produto: ProdutoDTO
  quantidade: number
  pesoUnit: number
  valorUnit: number
  quantidadeFalta: number
}

export interface HistoricoStatusPedidoDTO {
  id: string
  pedidoId: string
  statusAnterior: "AGUARDANDO" | "EM_ROTA" | "ENTREGUE" | null
  statusNovo: "AGUARDANDO" | "EM_ROTA" | "ENTREGUE"
  criadoEm: string
}

export type TipoFiado = "INTEGRAL" | "PARCIAL"

export interface PedidoDTO {
  id: string
  tipoPedido: "ENTREGA" | "BALCAO"
  clienteId: string | null
  cliente: ClienteDTO | null
  dataPedido: string
  statusEntrega: "AGUARDANDO" | "EM_ROTA" | "ENTREGUE" | null
  statusPagamento: "PENDENTE" | "PAGO" | "FIADO"
  metodoPagamento: MetodoPagamentoValue | null
  pagamentos?: PagamentoPedidoDTO[]
  baixas?: BaixaFiadoDTO[]
  observacoes: string | null
  desconto: number
  dataVencimentoFiado: string | null
  tipoFiado: TipoFiado | null
  valorAdiantadoFiado: number | null
  valorEmAbertoFiado: number | null
  itens: ItemPedidoDTO[]
  historicoStatus?: HistoricoStatusPedidoDTO[]
  consolidacoes?: Array<{
    id: string
    temFaltaRegistrada: boolean
    rota: { id: string; data: string; status: "ABERTA" | "FECHADA"; veiculo: VeiculoDTO }
  }>
  createdAt: string
  updatedAt: string
}

export interface ConsolidacaoRotaDTO {
  id: string
  data: string
  veiculoId: string
  veiculo: VeiculoDTO
  status: "ABERTA" | "FECHADA"
  itens: Array<{ id: string; pedidoId: string; pedido: PedidoDTO }>
  pesoTotal: number
  createdAt: string
}

export interface DashboardKPIsDTO {
  vendasTotal: number
  numeroPedidos: number
  ticketMedio: number
  totalFiado: number
  clientesComFiado: number
  totalClientes: number
  novosClientes: number
  pedidosEntrega: number
  pedidosBalcao: number
  vendasEntrega: number
  vendasBalcao: number
  entregasRealizadas: number
  pesoVendido: number
  metodosPagamento: Array<{ metodo: string; count: number; total: number }>
  topClientes: Array<{ id: string; nome: string; cidade: string; count: number; total: number }>
  grafico: Array<{ label: string; valor: number }>
  ultimosPedidos: PedidoDTO[]
  clientesFiado: ClienteDTO[]
  totalSaidas: number
  saldoLiquido: number
  topSaidasPorTipo: Array<{ tipo: string; total: number }>
}
