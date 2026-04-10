"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

type OrderItem = {
  id: number;
  quantity: number;
  price: number;
  product: { name: string; size: string | null };
};

type Order = {
  id: number;
  customer_name: string;
  total: number;
  surcharge: number;
  status: string;
  order_items: OrderItem[];
};

export default function PaymentPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    const res = await fetch(`/api/orders/${orderId}`);
    if (!res.ok) return;
    const data: Order = await res.json();
    setOrder(data);
    setLoading(false);
    if (data.status === "completed") {
      router.push(`/success?orderId=${orderId}`);
    }
  }, [orderId, router]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto text-center mt-20 text-gray-500">
        Loading order...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto text-center mt-20 text-red-500">
        Order not found.
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 px-4 pb-10">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 text-center">
        Payment
      </h1>
      <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-6">
        Order #{order.id} · {order.customer_name}
      </p>

      {/* Order Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 mb-6">
        {order.order_items.map((item) => (
          <div key={item.id} className="flex justify-between px-4 py-3 text-sm">
            <span className="text-gray-700 dark:text-gray-300">
              {item.product.name}
              {item.product.size ? ` (${item.product.size})` : ""} ×{" "}
              {item.quantity}
            </span>
            <span className="font-medium dark:text-white">
              ${item.price * item.quantity}
            </span>
          </div>
        ))}
        <div className="flex justify-between px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
          <span>Subtotal</span>
          <span>${order.total - order.surcharge}</span>
        </div>
        <div className="flex justify-between px-4 py-2 text-sm text-amber-600 dark:text-amber-400">
          <span>5% Surcharge</span>
          <span>+${order.surcharge}</span>
        </div>
        <div className="flex justify-between px-4 py-3 font-bold dark:text-white border-t border-gray-100 dark:border-gray-700">
          <span>Total</span>
          <span className="text-blue-600 dark:text-blue-400">
            ${order.total}
          </span>
        </div>
      </div>

      {/* PayNow QR */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center mb-6">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Scan to pay via PayNow
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
          Enter{" "}
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            ${order.total}
          </span>{" "}
          as the amount
        </p>
        <Image
          src="/paynow-qr.jpeg"
          alt="PayNow QR Code"
          width={220}
          height={220}
          className="rounded-lg"
          unoptimized
        />
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
          Staff will confirm and mark your order as paid.
        </p>
      </div>

      {/* Check Status */}
      <button
        onClick={fetchOrder}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors"
      >
        Check Order Status
      </button>
      <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-3">
        Page will redirect automatically once payment is confirmed.
      </p>
    </div>
  );
}
