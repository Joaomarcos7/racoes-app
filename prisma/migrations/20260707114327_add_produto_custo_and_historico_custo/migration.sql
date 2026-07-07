-- AlterTable
ALTER TABLE "Produto" ADD COLUMN "custo" REAL;

-- CreateTable
CREATE TABLE "HistoricoCusto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "produtoId" TEXT NOT NULL,
    "custoAnterior" REAL,
    "custoNovo" REAL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HistoricoCusto_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
