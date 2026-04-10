ALTER TABLE "Order" ALTER COLUMN "invoice_number" DROP NOT NULL;
ALTER TABLE "Order" ALTER COLUMN "invoice_number" DROP DEFAULT;
UPDATE "Order" SET "invoice_number" = NULL WHERE "invoice_number" = '';
CREATE UNIQUE INDEX IF NOT EXISTS "Order_invoice_number_key" ON "Order"("invoice_number");
