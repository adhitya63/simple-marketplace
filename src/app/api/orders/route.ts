import { prisma } from "@/lib/prisma";
import { sendInvoiceEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const orderSchema = z.object({
  customer_name: z.string().min(1),
  email: z.string().email(),
  items: z
    .array(
      z.object({
        product_id: z.number().int().positive(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});

export async function GET() {
  const orders = await prisma.order.findMany({
    orderBy: { created_at: "desc" },
    include: { order_items: { include: { product: true } } },
  });
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { customer_name, email, items } = parsed.data;

  // Fetch product prices from DB
  const productIds = items.map((i) => i.product_id);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  if (products.length !== productIds.length) {
    return NextResponse.json(
      { error: "One or more products not found" },
      { status: 400 },
    );
  }

  const productMap = new Map(products.map((p) => [p.id, p]));
  const subtotal = items.reduce((sum, item) => {
    const product = productMap.get(item.product_id)!;
    return sum + product.price * item.quantity;
  }, 0);
  const surcharge = Math.round(subtotal * 0.05);
  const total = subtotal + surcharge;

  // Generate invoice number: INV-YYYYMM-XXXXX (based on timestamp + random suffix for uniqueness)
  const now = new Date();
  const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const suffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  const invoice_number = `INV-${yyyymm}-${suffix}`;

  const order = await prisma.order.create({
    data: {
      customer_name,
      email,
      total,
      surcharge,
      invoice_number,
      order_items: {
        create: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: productMap.get(item.product_id)!.price,
        })),
      },
    },
    include: { order_items: { include: { product: true } } },
  });

  // Send invoice email (best-effort)
  try {
    await sendInvoiceEmail({
      to: email,
      customerName: customer_name,
      orderId: order.id,
      invoiceNumber: order.invoice_number,
      orderDate: order.created_at,
      items: order.order_items.map((oi) => ({
        name: oi.product.name,
        quantity: oi.quantity,
        price: oi.price,
      })),
      total,
      surcharge,
    });
  } catch {
    // Email failure should not block the order
    console.error("Failed to send invoice email");
  }

  return NextResponse.json({ orderId: order.id }, { status: 201 });
}
