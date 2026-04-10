"use client";

import { useState } from "react";

interface OrderItem {
  id: number;
  product: { name: string };
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  invoice_number: string | null;
  customer_name: string;
  email: string;
  total: number;
  surcharge: number;
  status: "pending" | "completed";
  created_at: string;
  order_items: OrderItem[];
}

// Editable item shape used in the modal
interface EditItem {
  name: string;
  quantity: number;
  price: number;
}

interface EditState {
  orderId: number;
  invoiceNumber: string;
  orderDate: string;
  customerName: string;
  email: string;
  items: EditItem[];
  surcharge: number;
  total: number;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModal, setEditModal] = useState<EditState | null>(null);
  const [sending, setSending] = useState(false);

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

  const openEditModal = (order: Order) => {
    // Format date as YYYY-MM-DD for the date input
    const d = new Date(order.created_at);
    const dateStr = d.toISOString().split("T")[0];
    setEditModal({
      orderId: order.id,
      invoiceNumber: order.invoice_number ?? "",
      orderDate: dateStr,
      customerName: order.customer_name,
      email: order.email,
      items: order.order_items.map((i) => ({
        name: i.product.name,
        quantity: i.quantity,
        price: i.price,
      })),
      surcharge: order.surcharge,
      total: order.total,
    });
  };

  const updateItem = (index: number, field: keyof EditItem, value: string) => {
    if (!editModal) return;
    const items = editModal.items.map((item, i) => {
      if (i !== index) return item;
      if (field === "quantity" || field === "price") {
        return { ...item, [field]: parseInt(value) || 0 };
      }
      return { ...item, [field]: value };
    });
    const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
    const surcharge = Math.round(subtotal * 0.05);
    setEditModal({
      ...editModal,
      items,
      surcharge,
      total: subtotal + surcharge,
    });
  };

  const addItem = () => {
    if (!editModal) return;
    setEditModal({
      ...editModal,
      items: [...editModal.items, { name: "", quantity: 1, price: 0 }],
    });
  };

  const removeItem = (index: number) => {
    if (!editModal) return;
    const items = editModal.items.filter((_, i) => i !== index);
    const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
    const surcharge = Math.round(subtotal * 0.05);
    setEditModal({
      ...editModal,
      items,
      surcharge,
      total: subtotal + surcharge,
    });
  };

  const handleResend = async () => {
    if (!editModal) return;
    setSending(true);
    try {
      const res = await fetch(`/api/orders/${editModal.orderId}/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: editModal.email,
          customerName: editModal.customerName,
          invoiceNumber: editModal.invoiceNumber || null,
          orderDate: editModal.orderDate || null,
          items: editModal.items,
          surcharge: editModal.surcharge,
          total: editModal.total,
        }),
      });
      if (res.ok) {
        alert("Invoice resent successfully.");
        setEditModal(null);
      } else {
        alert("Failed to resend invoice.");
      }
    } finally {
      setSending(false);
    }
  };

  const downloadInvoice = (id: number) => {
    window.open(`/api/orders/${id}/invoice`, "_blank");
  };

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto mt-24">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Admin Login
        </h1>
        <form
          onSubmit={handleLogin}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4"
        >
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ WebkitTextFillColor: "inherit" }}
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
      {/* Edit Invoice Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Edit Invoice — Order #{editModal.orderId}
              </h2>
              <button
                onClick={() => setEditModal(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              {/* Invoice Number & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    value={editModal.invoiceNumber}
                    readOnly
                    className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 text-gray-400 rounded-lg px-3 py-2 text-sm cursor-not-allowed"
                    style={{ WebkitTextFillColor: "inherit" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Order Date
                  </label>
                  <input
                    type="date"
                    value={editModal.orderDate}
                    onChange={(e) =>
                      setEditModal({ ...editModal, orderDate: e.target.value })
                    }
                    className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    style={{ WebkitTextFillColor: "inherit" }}
                  />
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={editModal.customerName}
                    onChange={(e) =>
                      setEditModal({
                        ...editModal,
                        customerName: e.target.value,
                      })
                    }
                    className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    style={{ WebkitTextFillColor: "inherit" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editModal.email}
                    onChange={(e) =>
                      setEditModal({ ...editModal, email: e.target.value })
                    }
                    className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    style={{ WebkitTextFillColor: "inherit" }}
                  />
                </div>
              </div>

              {/* Items */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Items
                </label>
                <div className="space-y-2">
                  {editModal.items.map((item, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[1fr_70px_80px_32px] gap-2 items-center"
                    >
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(i, "name", e.target.value)}
                        placeholder="Item name"
                        className="border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        style={{ WebkitTextFillColor: "inherit" }}
                      />
                      <input
                        type="number"
                        value={item.quantity}
                        min={1}
                        onChange={(e) =>
                          updateItem(i, "quantity", e.target.value)
                        }
                        placeholder="Qty"
                        className="border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
                        style={{ WebkitTextFillColor: "inherit" }}
                      />
                      <input
                        type="number"
                        value={item.price}
                        min={0}
                        onChange={(e) => updateItem(i, "price", e.target.value)}
                        placeholder="Price $"
                        className="border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-amber-500"
                        style={{ WebkitTextFillColor: "inherit" }}
                      />
                      <button
                        onClick={() => removeItem(i)}
                        className="text-red-400 hover:text-red-600 text-lg leading-none text-center"
                        title="Remove item"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addItem}
                  className="mt-2 text-xs text-amber-600 dark:text-amber-400 hover:underline"
                >
                  + Add item
                </button>
              </div>

              {/* Totals preview */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-3 text-sm space-y-1">
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>${editModal.total - editModal.surcharge}</span>
                </div>
                <div className="flex justify-between text-amber-600 dark:text-amber-400">
                  <span>5% Surcharge</span>
                  <span>+${editModal.surcharge}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-1 mt-1">
                  <span>Total</span>
                  <span>${editModal.total}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setEditModal(null)}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={handleResend}
                disabled={sending}
                className="px-5 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium rounded-lg"
              >
                {sending ? "Sending…" : "Resend Invoice"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Orders
        </h1>
        <button
          onClick={loadOrders}
          className="text-sm text-blue-600 hover:underline"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400 dark:text-gray-500">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No orders yet.</p>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">
                  #
                </th>
                <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">
                  Invoice
                </th>
                <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">
                  Email
                </th>
                <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">
                  Items
                </th>
                <th className="text-right px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">
                  Subtotal
                </th>
                <th className="text-right px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">
                  Surcharge
                </th>
                <th className="text-right px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">
                  Total
                </th>
                <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">
                  Date
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-4 py-3 text-gray-400 dark:text-gray-500">
                    #{order.id}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-amber-600 dark:text-amber-400">
                    {order.invoice_number ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    {order.customer_name}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {order.email}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {order.order_items
                      .map((i) => `${i.product.name} x${i.quantity}`)
                      .join(", ")}
                  </td>
                  <td className="px-4 py-3 text-right font-medium dark:text-white">
                    ${order.total - order.surcharge}
                  </td>
                  <td className="px-4 py-3 text-right text-amber-600 dark:text-amber-400">
                    +${order.surcharge}
                  </td>
                  <td className="px-4 py-3 text-right font-bold dark:text-white">
                    ${order.total}
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
                  <td className="px-4 py-3 text-gray-400 dark:text-gray-500">
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
                    {order.status === "completed" && (
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => openEditModal(order)}
                          className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline text-left"
                        >
                          Edit invoice
                        </button>
                        <button
                          onClick={() => downloadInvoice(order.id)}
                          className="text-xs text-amber-600 dark:text-amber-400 hover:underline text-left"
                        >
                          Download invoice
                        </button>
                      </div>
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
