/*
  Warnings:

  - You are about to drop the column `idProofNumber` on the `Visit` table. All the data in the column will be lost.
  - You are about to drop the column `organizationName` on the `Visit` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Visit` table. All the data in the column will be lost.
  - You are about to drop the column `photoBase64` on the `Visit` table. All the data in the column will be lost.
  - You are about to drop the column `vehicleNumber` on the `Visit` table. All the data in the column will be lost.
  - You are about to drop the column `visitorName` on the `Visit` table. All the data in the column will be lost.
  - Added the required column `visitorId` to the `Visit` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Visitor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "photoBase64" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "idProofNumber" TEXT,
    "vehicleNumber" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Visit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "visitId" TEXT NOT NULL,
    "visitorId" INTEGER NOT NULL,
    "personToVisit" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "qrValue" TEXT,
    "inTime" DATETIME,
    "outTime" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" DATETIME,
    "rejectedAt" DATETIME,
    CONSTRAINT "Visit_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Visit" ("approvedAt", "createdAt", "department", "id", "inTime", "outTime", "personToVisit", "qrValue", "reason", "rejectedAt", "status", "visitId") SELECT "approvedAt", "createdAt", "department", "id", "inTime", "outTime", "personToVisit", "qrValue", "reason", "rejectedAt", "status", "visitId" FROM "Visit";
DROP TABLE "Visit";
ALTER TABLE "new_Visit" RENAME TO "Visit";
CREATE UNIQUE INDEX "Visit_visitId_key" ON "Visit"("visitId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Visitor_phone_key" ON "Visitor"("phone");
