import { sendInvoiceEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const resendSchema = z.object({
  to: z.string().email(),
  customerName: z.string().min(1),
  invoiceNumber: z.string().nullable().optional(),
  orderDate: z.string().nullable().optional(),
  items: z
    .array(
      z.object({
        name: z.string().min(1),
        quantity: z.number().int().positive(),
        price: z.number().int().nonnegative(),
      }),
    )
    .min(1),
  surcharge: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const orderId = parseInt(id);
  if (isNaN(orderId)) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = resendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const {
    to,
    customerName,
    invoiceNumber,
    orderDate,
    items,
    surcharge,
    total,
  } = parsed.data;

  await sendInvoiceEmail({
    to,
    customerName,
    orderId,
    invoiceNumber,
    orderDate,
    items,
    total,
    surcharge,
  });

  console.log(`[CUSTOM RESEND] Invoice for order #${orderId} sent to ${to}`);
  return NextResponse.json({ ok: true });
}
