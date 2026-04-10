import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const orderId = parseInt(id);
  if (isNaN(orderId)) {
    return new NextResponse("Invalid order ID", { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { order_items: { include: { product: true } } },
  });

  if (!order) {
    return new NextResponse("Order not found", { status: 404 });
  }

  const subtotal = order.total - order.surcharge;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";

  const itemRows = order.order_items
    .map(
      (i) => `
      <tr>
        <td>${i.product.name}</td>
        <td style="text-align:center;">${i.quantity}</td>
        <td style="text-align:right;">$${i.price}</td>
        <td style="text-align:right;">$${i.price * i.quantity}</td>
      </tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${order.invoice_number ?? `Invoice #${order.id}`} – District 77</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Georgia', serif;
      background: #0a0a0a;
      color: #e0e0e0;
      padding: 48px 32px;
      max-width: 720px;
      margin: auto;
    }
    .logo { text-align: center; margin-bottom: 32px; }
    .logo img { max-width: 240px; width: 100%; }
    .header { text-align: center; margin-bottom: 32px; }
    .header h1 { color: #c9a84c; font-size: 28px; letter-spacing: 3px; margin-bottom: 4px; }
    .header p { color: #666; font-size: 13px; }
    .meta { display: flex; justify-content: space-between; margin-bottom: 28px; font-size: 14px; }
    .meta div { line-height: 1.8; }
    .meta .label { color: #888; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; }
    .meta .value { color: #fff; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead tr { border-bottom: 1px solid #333; }
    thead th {
      padding: 10px 8px;
      text-align: left;
      color: #c9a84c;
      font-size: 11px;
      letter-spacing: 1px;
      text-transform: uppercase;
      font-weight: normal;
    }
    thead th:last-child, thead th:nth-child(3), thead th:nth-child(2) { text-align: right; }
    thead th:nth-child(2) { text-align: center; }
    tbody tr { border-bottom: 1px solid #1a1a1a; }
    tbody td { padding: 12px 8px; font-size: 14px; color: #ddd; }
    tbody td:nth-child(2) { text-align: center; color: #aaa; }
    tbody td:nth-child(3), tbody td:nth-child(4) { text-align: right; }
    .totals { margin-left: auto; width: 260px; font-size: 14px; }
    .totals .row { display: flex; justify-content: space-between; padding: 6px 0; color: #aaa; }
    .totals .row.surcharge .amount { color: #e6a817; }
    .totals .row.total { border-top: 1px solid #333; margin-top: 6px; padding-top: 12px; color: #c9a84c; font-size: 16px; font-weight: bold; }
    .footer { text-align: center; margin-top: 48px; color: #444; font-size: 12px; line-height: 1.8; }
    .footer a { color: #c9a84c; text-decoration: none; }
    @media print {
      body { background: #fff; color: #000; padding: 24px; }
      .header h1, .meta .label, thead th, .totals .row.total { color: #8B6914; }
      .totals .row.surcharge .amount { color: #b87333; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="logo">
    <img src="${baseUrl}/logo.jpeg" alt="District 77 Private Club" />
  </div>

  <div class="header">
    <h1>INVOICE</h1>
    <p>Order #${order.id}</p>
    ${order.invoice_number ? `<p style="color:#c9a84c;font-size:14px;letter-spacing:2px;margin-top:6px;">${order.invoice_number}</p>` : ""}
  </div>

  <div class="meta">
    <div>
      <div class="label">Billed to</div>
      <div class="value">${order.customer_name}</div>
      <div style="color:#888;font-size:13px;">${order.email}</div>
    </div>
    <div style="text-align:right;">
      <div class="label">Date</div>
      <div class="value">${new Date(order.created_at).toLocaleDateString("en-SG", { day: "2-digit", month: "long", year: "numeric" })}</div>
      <div style="margin-top:8px;">
        <span style="background:${order.status === "completed" ? "#14532d" : "#78350f"};color:${order.status === "completed" ? "#4ade80" : "#fbbf24"};padding:2px 10px;border-radius:20px;font-size:11px;letter-spacing:1px;">
          ${order.status.toUpperCase()}
        </span>
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th style="text-align:center;">Qty</th>
        <th style="text-align:right;">Unit Price</th>
        <th style="text-align:right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <div class="totals">
    <div class="row">
      <span>Subtotal</span>
      <span class="amount">$${subtotal}</span>
    </div>
    <div class="row surcharge">
      <span>5% Surcharge</span>
      <span class="amount">+$${order.surcharge}</span>
    </div>
    <div class="row total">
      <span>Total</span>
      <span class="amount">$${order.total}</span>
    </div>
  </div>

  <div class="footer">
    <p>District 77 Private Club</p>
    <p>77B Boat Quay, Singapore 049865</p>
    <p><a href="mailto:distict77@gmail.com">distict77@gmail.com</a></p>
  </div>

  <div class="no-print" style="text-align:center;margin-top:40px;">
    <button onclick="window.print()" style="background:#c9a84c;color:#000;border:none;padding:10px 28px;border-radius:6px;font-size:14px;cursor:pointer;letter-spacing:1px;">
      PRINT / SAVE AS PDF
    </button>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
