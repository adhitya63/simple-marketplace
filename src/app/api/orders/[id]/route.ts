import { prisma } from "@/lib/prisma";
import { sendInvoiceEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  status: z.enum(["pending", "completed"]),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const orderId = parseInt(id);
  if (isNaN(orderId)) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { order_items: { include: { product: true } } },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const orderId = parseInt(id);
  if (isNaN(orderId)) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: parsed.data.status },
    include: { order_items: { include: { product: true } } },
  });

  if (parsed.data.status === "completed") {
    try {
      await sendInvoiceEmail({
        to: order.email,
        customerName: order.customer_name,
        orderId: order.id,
        items: order.order_items.map((i) => ({
          name: i.product.name,
          quantity: i.quantity,
          price: i.price,
        })),
        total: order.total,
        surcharge: order.surcharge,
      });
      console.log(`[ORDER COMPLETED] Invoice sent to ${order.email}`);
    } catch (err) {
      console.error("[EMAIL FAILED]", err);
    }
  }

  return NextResponse.json(order);
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const orderId = parseInt(id);
  if (isNaN(orderId)) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { order_items: { include: { product: true } } },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Recalculate surcharge for old orders that predate the surcharge migration
  const effectiveSurcharge =
    order.surcharge === 0 && order.total > 0
      ? Math.round(order.total * 0.05)
      : order.surcharge;

  await sendInvoiceEmail({
    to: order.email,
    customerName: order.customer_name,
    orderId: order.id,
    items: order.order_items.map((i) => ({
      name: i.product.name,
      quantity: i.quantity,
      price: i.price,
    })),
    total: order.total,
    surcharge: effectiveSurcharge,
  });

  console.log(`[RESEND] Invoice resent to ${order.email}`);
  return NextResponse.json({ ok: true });
}
