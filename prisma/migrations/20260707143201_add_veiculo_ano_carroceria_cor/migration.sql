/*
  Warnings:

  - Added the required column `ano` to the `Veiculo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `carroceria` to the `Veiculo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cor` to the `Veiculo` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Veiculo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "placa" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "carroceria" TEXT NOT NULL,
    "cor" TEXT NOT NULL,
    "pesoMaximo" REAL NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_Veiculo" ("ativo", "id", "modelo", "pesoMaximo", "placa", "ano", "carroceria", "cor") SELECT "ativo", "id", "modelo", "pesoMaximo", "placa", 2020, 'BAU', 'Branco' FROM "Veiculo";
DROP TABLE "Veiculo";
ALTER TABLE "new_Veiculo" RENAME TO "Veiculo";
CREATE UNIQUE INDEX "Veiculo_placa_key" ON "Veiculo"("placa");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
