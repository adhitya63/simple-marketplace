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
  surcharge: number;
}

export async function sendInvoiceEmail({
  to,
  customerName,
  orderId,
  items,
  total,
  surcharge,
}: InvoiceEmailParams) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#000;padding:32px;border-radius:12px;">
      <!-- Logo -->
      <div style="text-align:center;margin-bottom:24px;">
        <img src="${baseUrl}/logo.jpeg" alt="District 77 Private Club" style="max-width:280px;width:100%;" />
      </div>

      <!-- Card -->
      <div style="background:#1a1a1a;border-radius:8px;padding:24px;margin-bottom:16px;">
        <h2 style="color:#c9a84c;margin:0 0 4px 0;font-size:18px;letter-spacing:1px;">ORDER CONFIRMATION</h2>
        <p style="color:#888;margin:0 0 20px 0;font-size:13px;">Order #${orderId}</p>
        <p style="color:#fff;margin:0 0 20px 0;">Hi <strong>${customerName}</strong>, thank you for your order!</p>

        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="border-bottom:1px solid #333;">
              <th style="padding:8px 4px;text-align:left;color:#c9a84c;font-size:12px;letter-spacing:1px;">ITEM</th>
              <th style="padding:8px 4px;text-align:center;color:#c9a84c;font-size:12px;letter-spacing:1px;">QTY</th>
              <th style="padding:8px 4px;text-align:right;color:#c9a84c;font-size:12px;letter-spacing:1px;">PRICE</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (item) => `
            <tr style="border-bottom:1px solid #2a2a2a;">
              <td style="padding:10px 4px;color:#fff;">${item.name}</td>
              <td style="padding:10px 4px;color:#ccc;text-align:center;">${item.quantity}</td>
              <td style="padding:10px 4px;color:#fff;text-align:right;">$${item.price * item.quantity}</td>
            </tr>`,
              )
              .join("")}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding:8px 4px;text-align:right;color:#888;">SUBTOTAL</td>
              <td style="padding:8px 4px;text-align:right;color:#fff;">$${total - surcharge}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding:8px 4px;text-align:right;color:#888;">5% SURCHARGE</td>
              <td style="padding:8px 4px;text-align:right;color:#e6a817;">+$${surcharge}</td>
            </tr>
            <tr style="border-top:1px solid #333;">
              <td colspan="2" style="padding:12px 4px;text-align:right;color:#c9a84c;font-weight:bold;">TOTAL</td>
              <td style="padding:12px 4px;text-align:right;color:#c9a84c;font-weight:bold;font-size:16px;">$${total}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p style="color:#555;font-size:12px;text-align:center;margin:0;">
        77B Boat Quay, Singapore 049865
      </p>
      <p style="color:#555;font-size:12px;text-align:center;margin:4px 0 0 0;">
        <a href="mailto:distict77@gmail.com" style="color:#c9a84c;text-decoration:none;">distict77@gmail.com</a>
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Invoice - Order #${orderId}`,
    html,
  });
}
