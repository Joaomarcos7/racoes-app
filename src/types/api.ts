export interface ProdutoDTO {
  id: string
  nome: string
  peso: number
  valorUnitario: number
  ativo: boolean
  createdAt: string
}

export interface ClienteDTO {
  id: string
  nome: string
  telefone: string | null
  email: string | null
  cidade: string
  ativo: boolean
  createdAt: string
  temFiado?: boolean
}

export interface VeiculoDTO {
  id: string
  placa: string
  modelo: string
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
}

export interface PedidoDTO {
  id: string
  clienteId: string
  cliente: ClienteDTO
  dataPedido: string
  statusEntrega: "AGUARDANDO" | "EM_ROTA" | "ENTREGUE"
  statusPagamento: "PENDENTE" | "PAGO" | "FIADO"
  metodoPagamento: "DINHEIRO" | "PIX" | "BOLETO" | "CHEQUE" | "FIADO" | null
  observacoes: string | null
  itens: ItemPedidoDTO[]
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
  grafico: Array<{ label: string; valor: number }>
  ultimosPedidos: PedidoDTO[]
  clientesFiado: ClienteDTO[]
}
