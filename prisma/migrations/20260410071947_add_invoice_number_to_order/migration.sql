-- AlterTable: add invoice_number (idempotent)
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "invoice_number" TEXT;
ALTER TABLE "Order" ALTER COLUMN "invoice_number" DROP NOT NULL;
ALTER TABLE "Order" ALTER COLUMN "invoice_number" DROP DEFAULT;
UPDATE "Order" SET "invoice_number" = NULL WHERE "invoice_number" = '';

-- AlterTable: add remarks (idempotent)
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "remarks" TEXT;

-- CreateIndex (unique; PostgreSQL allows multiple NULLs)
CREATE UNIQUE INDEX IF NOT EXISTS "Order_invoice_number_key" ON "Order"("invoice_number");
