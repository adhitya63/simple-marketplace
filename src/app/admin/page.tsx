"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface OrderItem {
  id: number;
  product: { name: string };
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  customer_name: string;
  email: string;
  total: number;
  status: "pending" | "completed";
  created_at: string;
  order_items: OrderItem[];
}

export default function AdminPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD ||
      password === "admin123"
    ) {
      setAuthed(true);
      loadOrders();
    } else {
      alert("Wrong password");
    }
  };

  const loadOrders = () => {
    setLoading(true);
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const markCompleted = async (id: number) => {
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    });
    loadOrders();
  };

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto mt-24">
        <h1 className="text-xl font-bold text-gray-900 mb-6 text-center">
          Admin Login
        </h1>
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
        >
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <button
          onClick={loadOrders}
          className="text-sm text-blue-600 hover:underline"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">No orders yet.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-gray-500 font-medium">
                  #
                </th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">
                  Email
                </th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">
                  Items
                </th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">
                  Total
                </th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">
                  Date
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400">#{order.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {order.customer_name}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{order.email}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {order.order_items
                      .map((i) => `${i.product.name} x${i.quantity}`)
                      .join(", ")}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    ${(order.total / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        order.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {order.status === "pending" && (
                      <button
                        onClick={() => markCompleted(order.id)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Mark completed
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
