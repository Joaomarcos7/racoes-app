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
  metodoPagamento: "DINHEIRO" | "PIX" | "PIX_TERCEIROS" | "BOLETO" | "CHEQUE" | "CARTAO_CREDITO" | "CARTAO_DEBITO" | null
  observacoes: string | null
  desconto: number
  dataVencimentoFiado: string | null
  tipoFiado: TipoFiado | null
  valorAdiantadoFiado: number | null
  valorEmAbertoFiado: number | null
  itens: ItemPedidoDTO[]
  historicoStatus?: HistoricoStatusPedidoDTO[]
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
}
