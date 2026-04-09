"use client";

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CheckoutPage() {
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();
  const router = useRouter();
  const [form, setForm] = useState({ customer_name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError("Failed to place order. Please try again.");
      return;
    }

    clearCart();
    router.push(`/success?orderId=${data.orderId}`);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      {items.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        <>
          {/* Cart items */}
          <div className="bg-white rounded-xl border border-gray-200 mb-6 divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    ${(item.price / 100).toFixed(2)} each
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 font-bold flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 font-bold flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
                <p className="w-20 text-right font-medium">
                  ${((item.price * item.quantity) / 100).toFixed(2)}
                </p>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-400 hover:text-red-600 text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
            <div className="p-4 flex justify-end">
              <p className="font-bold text-lg">
                Total: ${(total / 100).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Order form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
          >
            <h2 className="font-semibold text-gray-800">Your Details</h2>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Name</label>
              <input
                type="text"
                required
                value={form.customer_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, customer_name: e.target.value }))
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="john@example.com"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              {loading ? "Placing Order…" : "Place Order"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
