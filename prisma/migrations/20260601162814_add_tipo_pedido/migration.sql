-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Pedido" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipoPedido" TEXT NOT NULL DEFAULT 'ENTREGA',
    "clienteId" TEXT,
    "dataPedido" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusEntrega" TEXT,
    "statusPagamento" TEXT NOT NULL DEFAULT 'PENDENTE',
    "metodoPagamento" TEXT,
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Pedido_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Pedido" ("ativo", "clienteId", "createdAt", "dataPedido", "id", "metodoPagamento", "observacoes", "statusEntrega", "statusPagamento", "updatedAt") SELECT "ativo", "clienteId", "createdAt", "dataPedido", "id", "metodoPagamento", "observacoes", "statusEntrega", "statusPagamento", "updatedAt" FROM "Pedido";
DROP TABLE "Pedido";
ALTER TABLE "new_Pedido" RENAME TO "Pedido";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
