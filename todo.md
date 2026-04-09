# 🛒 E-commerce MVP TODO (Next.js + Prisma) — NO PAYMENT VERSION

## 📌 Project Goal

Build a minimal e-commerce system that allows:

* Users to browse products
* Add items to cart
* Checkout as guest
* Place order (no real payment)
* Receive invoice via email
* Admin can view orders

---

# ⚙️ Tech Stack

* Next.js (App Router)
* Next.js API Routes (Route Handlers)
* Prisma ORM
* PostgreSQL / Supabase
* Tailwind CSS
* Email: Nodemailer / Resend

---

# 📁 Project Setup

## ✅ Initialize Project

* [ ] Create Next.js app (App Router)
* [ ] Install dependencies:

  * [ ] prisma
  * [ ] @prisma/client
  * [ ] nodemailer (or resend)
  * [ ] zod (optional)
* [ ] Setup Tailwind CSS

## ✅ Prisma Setup

* [ ] Initialize Prisma
* [ ] Configure `.env` DATABASE_URL
* [ ] Create schema
* [ ] Run migration
* [ ] Generate Prisma client

---

# 🗄️ Database Schema

## ✅ products

* [ ] id (int, pk)
* [ ] name (string)
* [ ] price (int)
* [ ] image_url (string)
* [ ] created_at

## ✅ orders

* [ ] id (int, pk)
* [ ] customer_name (string)
* [ ] email (string)
* [ ] total (int)
* [ ] status (enum: pending, completed)
* [ ] created_at

## ✅ order_items

* [ ] id (int, pk)
* [ ] order_id (relation)
* [ ] product_id (relation)
* [ ] quantity (int)
* [ ] price (int)

---

# 🌐 Frontend

## 🏠 Homepage (/)

* [ ] Fetch products from API
* [ ] Display product list
* [ ] Add to cart button

---

## 🛒 Cart State

* [ ] Implement cart using:

  * [ ] React Context OR
  * [ ] localStorage
* [ ] Add/remove item
* [ ] Update quantity

---

## 💳 Checkout Page (/checkout)

* [ ] Show cart items
* [ ] Show total price
* [ ] Form inputs:

  * [ ] customer_name
  * [ ] email
* [ ] Button: **"Place Order"**
* [ ] On submit:

  * [ ] Call POST /api/orders
  * [ ] Redirect to success page

---

## 🎉 Success Page (/success)

* [ ] Show message:

  * "Order received"
  * "Check your email for invoice"
* [ ] Show Order ID

---

# 🔌 Backend (API Routes)

## 📦 Products API

* [ ] GET /api/products

  * Return all products

---

## 🧾 Orders API

### Create Order

* [ ] POST /api/orders

  * [ ] Validate input
  * [ ] Calculate total
  * [ ] Save order
  * [ ] Save order_items
  * [ ] Send invoice email
  * [ ] Return orderId

---

### Get Orders (Admin)

* [ ] GET /api/orders

  * Return all orders (latest first)

---

### Update Order Status (Optional)

* [ ] PATCH /api/orders/:id

  * Update status to "completed"

---

# 📧 Email System

## ✅ Setup Email Service

* [ ] Configure SMTP / Resend

## 📩 Send Invoice Email (ON ORDER CREATE)

* [ ] Include:

  * Order ID
  * Items
  * Total price
  * Message: "No payment required (prototype)"

---

# 🛠️ Admin Panel (/admin)

## 🔐 Basic Access

* [ ] Simple protection (env password or basic auth)

## 📊 Orders Table

* [ ] List all orders
* [ ] Columns:

  * [ ] Name
  * [ ] Email
  * [ ] Total
  * [ ] Status
  * [ ] Date

## ✅ Actions (Optional)

* [ ] Button: "Mark as Completed"

---

# 🔄 Flow Integration

## 🧍 Customer Flow

* [ ] Add to cart
* [ ] Checkout
* [ ] Place order
* [ ] Email sent automatically
* [ ] Redirect to success page

---

## 👨‍💼 Admin Flow

* [ ] Open /admin
* [ ] View orders
* [ ] (Optional) Mark as completed

---

# 🎨 UI (Minimal)

* [ ] Use Tailwind
* [ ] Keep simple & responsive
* [ ] No complex UI

---

# 🚀 Deployment

* [ ] Setup env variables
* [ ] Deploy to Vercel
* [ ] Setup DB (Supabase / Neon)
* [ ] Test live flow

---

# 🧪 Testing Checklist

* [ ] Can create order
* [ ] Cart total correct
* [ ] Email sent successfully
* [ ] Success page works
* [ ] Admin sees orders

---

# ❌ Out of Scope (DO NOT BUILD)

* [ ] Payment gateway
* [ ] QR payment page
* [ ] Authentication system
* [ ] Inventory management
* [ ] Analytics dashboard
* [ ] Receipt resend feature

---

# 🧠 Notes for AI Agent

* Focus on working end-to-end flow
* Do NOT over-engineer
* Prioritize speed over perfection
* Keep API simple
* Avoid unnecessary abstractions

---
