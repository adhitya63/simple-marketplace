import { prisma } from "@/lib/prisma";
import { sendInvoiceEmail } from "@/lib/email";
import { notFound, redirect } from "next/navigation";

export default async function PayConfirmPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const id = parseInt(orderId);

  if (isNaN(id)) notFound();

  const order = await prisma.order.findUnique({
    where: { id },
    include: { order_items: { include: { product: true } } },
  });
  if (!order) notFound();

  // If already completed, go straight to success
  if (order.status === "completed") {
    redirect(`/success?orderId=${id}`);
  }

  // Mark as completed
  await prisma.order.update({
    where: { id },
    data: { status: "completed" },
  });

  console.log(
    `[ORDER PAID] Order #${id} — ${order.customer_name} <${order.email}> — Total: $${order.total}`,
  );

  // Send invoice email
  try {
    await sendInvoiceEmail({
      to: order.email,
      customerName: order.customer_name,
      orderId: order.id,
      items: order.order_items.map((oi) => ({
        name:
          oi.product.name + (oi.product.size ? ` (${oi.product.size})` : ""),
        quantity: oi.quantity,
        price: oi.price,
      })),
      total: order.total,
    });
    console.log(`[EMAIL SENT] Invoice sent to ${order.email} for order #${id}`);
  } catch (err) {
    console.error(
      `[EMAIL FAILED] Could not send invoice for order #${id}:`,
      err,
    );
  }

  redirect(`/success?orderId=${id}`);
}
