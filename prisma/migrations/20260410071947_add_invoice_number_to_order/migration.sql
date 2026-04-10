-- Add column if not already exists (handles partial migration)
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "invoice_number" TEXT;

-- Allow NULL values
ALTER TABLE "Order" ALTER COLUMN "invoice_number" DROP NOT NULL;
ALTER TABLE "Order" ALTER COLUMN "invoice_number" DROP DEFAULT;

-- Set empty strings to NULL so unique constraint can be applied
UPDATE "Order" SET "invoice_number" = NULL WHERE "invoice_number" = '';

-- CreateIndex (unique; PostgreSQL allows multiple NULLs)
CREATE UNIQUE INDEX IF NOT EXISTS "Order_invoice_number_key" ON "Order"("invoice_number");

CREATE UNIQUE INDEX "Order_invoice_number_key" ON "Order"("invoice_number");
