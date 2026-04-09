import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<
  typeof PrismaClient
>[0]);

async function main() {
  // Clear existing products
  await prisma.product.deleteMany();

  await prisma.product.createMany({
    data: [
      {
        name: "Ladies Drink",
        size: "One Pint",
        price: 50,
        image_url:
          "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80",
      },
      {
        name: "Ladies Drink",
        size: "1 Tray of 5",
        price: 100,
        image_url:
          "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80",
      },
      {
        name: "Ladies Drink",
        size: "1 Tray of 10",
        price: 200,
        image_url:
          "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80",
      },
      {
        name: "Ladies Drink",
        size: "Booking",
        price: 300,
        image_url:
          "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80",
      },
      {
        name: "Martell VSOP",
        price: 200,
        image_url:
          "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&q=80",
      },
      {
        name: "Hennessy VSOP",
        price: 200,
        image_url:
          "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&q=80",
      },
      {
        name: "Glenlivet 12 Years",
        price: 200,
        image_url:
          "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&q=80",
      },
      {
        name: "Roku Gin",
        price: 200,
        image_url:
          "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&q=80",
      },
      {
        name: "Martell Noblige",
        price: 260,
        image_url:
          "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&q=80",
      },
      {
        name: "Macallan 12",
        price: 380,
        image_url:
          "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&q=80",
      },
      {
        name: "Martell Cordon Bleu",
        price: 380,
        image_url:
          "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&q=80",
      },
      {
        name: "Heineken Pint Bucket of 8",
        price: 77,
        image_url:
          "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80",
      },
      {
        name: "Red / White Wine",
        price: 77,
        image_url:
          "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80",
      },
    ],
  });

  console.log("✅ Seeded 13 products");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
