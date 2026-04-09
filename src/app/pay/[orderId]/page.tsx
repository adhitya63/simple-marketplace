import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

export default async function PayConfirmPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const id = parseInt(orderId);

  if (isNaN(id)) notFound();

  const order = await prisma.order.findUnique({ where: { id } });
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

  redirect(`/success?orderId=${id}`);
}
