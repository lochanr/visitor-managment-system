-- CreateTable
CREATE TABLE "Visit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "visitId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "visitorName" TEXT NOT NULL,
    "photoBase64" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "personToVisit" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "idProofNumber" TEXT,
    "vehicleNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "qrValue" TEXT,
    "inTime" DATETIME,
    "outTime" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" DATETIME,
    "rejectedAt" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "Visit_visitId_key" ON "Visit"("visitId");
