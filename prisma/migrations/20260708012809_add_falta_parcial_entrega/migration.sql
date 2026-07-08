-- DropIndex
DROP INDEX "ConsolidacaoItem_pedidoId_key";

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ItemPedido" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pedidoId" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "pesoUnit" REAL NOT NULL,
    "valorUnit" REAL NOT NULL,
    "quantidadeFalta" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ItemPedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ItemPedido_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ItemPedido" ("id", "pedidoId", "pesoUnit", "produtoId", "quantidade", "valorUnit") SELECT "id", "pedidoId", "pesoUnit", "produtoId", "quantidade", "valorUnit" FROM "ItemPedido";
DROP TABLE "ItemPedido";
ALTER TABLE "new_ItemPedido" RENAME TO "ItemPedido";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
