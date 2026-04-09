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
        name: "Wireless Headphones",
        price: 4999, // $49.99 in cents
        image_url:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
      },
      {
        name: "Mechanical Keyboard",
        price: 8999,
        image_url:
          "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80",
      },
      {
        name: "USB-C Hub",
        price: 2999,
        image_url:
          "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&q=80",
      },
      {
        name: "Laptop Stand",
        price: 3499,
        image_url:
          "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=80",
      },
      {
        name: "Webcam HD",
        price: 5999,
        image_url:
          "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80",
      },
      {
        name: "Mouse Pad XL",
        price: 1499,
        image_url:
          "https://images.unsplash.com/photo-1616400619175-5beda3a17896?w=400&q=80",
      },
    ],
  });

  console.log("✅ Seeded 6 products");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
