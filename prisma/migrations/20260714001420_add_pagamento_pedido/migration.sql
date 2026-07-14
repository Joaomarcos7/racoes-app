-- CreateTable
CREATE TABLE "PagamentoPedido" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pedidoId" TEXT NOT NULL,
    "metodo" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    CONSTRAINT "PagamentoPedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
