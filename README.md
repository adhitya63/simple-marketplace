# Simple Marketplace

A minimal e-commerce prototype built with **Next.js 16**, **Prisma 7**, **PostgreSQL**, **Tailwind CSS**, and **Nodemailer**.

## Features

- Browse products on the homepage
- Add items to cart (persisted in localStorage)
- Guest checkout with name + email
- Place order (no real payment)
- Invoice sent via email on order creation
- Admin panel to view and manage orders

---

## Getting Started

### 1. Configure environment variables

Fill in the `.env` file:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="your-email@gmail.com"
ADMIN_PASSWORD="admin123"
```

### 2. Run the database migration

```bash
npm run db:migrate
```

### 3. Seed sample products (optional)

```bash
npm run db:seed
```

### 4. Start the dev server

```bash
npm run dev
```

Open http://localhost:3000.

---

## Pages

| Route     | Description                              |
|-----------|------------------------------------------|
| /         | Product listing                          |
| /checkout | Cart and order form                      |
| /success  | Order confirmation                       |
| /admin    | Orders dashboard (password: admin123)    |

## API Routes

| Method | Path             | Description                        |
|--------|------------------|------------------------------------|
| GET    | /api/products    | List all products                  |
| POST   | /api/orders      | Create order + send invoice email  |
| GET    | /api/orders      | List all orders (admin)            |
| PATCH  | /api/orders/:id  | Update order status                |

---

## Tech Stack

- Next.js 16 - App Router, API Routes
- Prisma 7 - ORM with PostgreSQL adapter
- Tailwind CSS 4 - Styling
- Nodemailer - Invoice emails via SMTP
- Zod - Input validation
