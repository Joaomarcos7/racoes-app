-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ConsolidacaoItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "consolidacaoRotaId" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "temFaltaRegistrada" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ConsolidacaoItem_consolidacaoRotaId_fkey" FOREIGN KEY ("consolidacaoRotaId") REFERENCES "ConsolidacaoRota" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ConsolidacaoItem_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ConsolidacaoItem" ("consolidacaoRotaId", "id", "pedidoId") SELECT "consolidacaoRotaId", "id", "pedidoId" FROM "ConsolidacaoItem";
DROP TABLE "ConsolidacaoItem";
ALTER TABLE "new_ConsolidacaoItem" RENAME TO "ConsolidacaoItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
