-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Produto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "peso" REAL NOT NULL,
    "valorUnitario" REAL NOT NULL,
    "custo" REAL,
    "tipo" TEXT NOT NULL DEFAULT 'CONSUMIDOR_FINAL',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Produto" ("ativo", "createdAt", "custo", "id", "nome", "peso", "valorUnitario") SELECT "ativo", "createdAt", "custo", "id", "nome", "peso", "valorUnitario" FROM "Produto";
DROP TABLE "Produto";
ALTER TABLE "new_Produto" RENAME TO "Produto";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
