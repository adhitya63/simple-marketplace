import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface InvoiceEmailParams {
  to: string;
  customerName: string;
  orderId: number;
  items: OrderItem[];
  total: number;
}

export async function sendInvoiceEmail({
  to,
  customerName,
  orderId,
  items,
  total,
}: InvoiceEmailParams) {
  const itemsHtml = items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px;border:1px solid #ddd;">${item.name}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:center;">${item.quantity}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:right;">$${item.price}</td>
        </tr>`,
    )
    .join("");

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;">
      <h2 style="color:#1a1a1a;">Order Confirmation #${orderId}</h2>
      <p>Hi <strong>${customerName}</strong>, thank you for your order!</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;">
        <thead>
          <tr style="background:#f5f5f5;">
            <th style="padding:8px;border:1px solid #ddd;text-align:left;">Product</th>
            <th style="padding:8px;border:1px solid #ddd;">Qty</th>
            <th style="padding:8px;border:1px solid #ddd;text-align:right;">Price</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:8px;border:1px solid #ddd;text-align:right;font-weight:bold;">Total</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:right;font-weight:bold;">$${total}</td>
          </tr>
        </tfoot>
      </table>
      <p style="color:#888;font-size:14px;"><em>Thank you for your purchase!</em></p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Invoice - Order #${orderId}`,
    html,
  });
}
