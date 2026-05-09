import bcrypt from "bcrypt";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  "Ноутбуки",
  "Смартфони",
  "Монітори",
  "Комплектуючі",
  "Аксесуари",
];

const products = [
  {
    title: "MacBook Air 13 M3",
    description: "Легкий ноутбук для навчання, роботи та щоденної продуктивності.",
    price: 49999,
    stock: 12,
    image: "laptop-mint",
    categoryName: "Ноутбуки",
  },
  {
    title: "Lenovo Legion Slim 5",
    description: "Потужний ігровий ноутбук з продуктивною графікою та якісним екраном.",
    price: 58999,
    stock: 7,
    image: "laptop-coral",
    categoryName: "Ноутбуки",
  },
  {
    title: "Samsung Galaxy S25",
    description: "Флагманський смартфон з яскравим дисплеєм, швидкою камерою та 5G.",
    price: 39499,
    stock: 18,
    image: "phone-coral",
    categoryName: "Смартфони",
  },
  {
    title: "iPhone 16",
    description: "Смартфон Apple з потужним процесором, якісною камерою і зручною екосистемою.",
    price: 44999,
    stock: 10,
    image: "phone-mint",
    categoryName: "Смартфони",
  },
  {
    title: "LG UltraGear 27",
    description: "27-дюймовий монітор для ігор і роботи з високою частотою оновлення.",
    price: 13899,
    stock: 15,
    image: "monitor-cyan",
    categoryName: "Монітори",
  },
  {
    title: "Dell UltraSharp U2724D",
    description: "Професійний монітор з точною передачею кольору для офісу та дизайну.",
    price: 18999,
    stock: 9,
    image: "monitor-mint",
    categoryName: "Монітори",
  },
  {
    title: "AMD Ryzen 7 7800X3D",
    description: "Процесор для продуктивних ігрових ПК та робочих станцій.",
    price: 16999,
    stock: 11,
    image: "component-amber",
    categoryName: "Комплектуючі",
  },
  {
    title: "Kingston Fury Beast 32GB",
    description: "Комплект оперативної пам'яті DDR5 для сучасних ПК.",
    price: 5299,
    stock: 24,
    image: "component-cyan",
    categoryName: "Комплектуючі",
  },
  {
    title: "Logitech MX Keys S",
    description: "Тиха бездротова клавіатура з підсвіткою для комфортної роботи.",
    price: 4299,
    stock: 20,
    image: "accessory-amber",
    categoryName: "Аксесуари",
  },
  {
    title: "Sony WH-1000XM5",
    description: "Бездротові навушники з активним шумозаглушенням і чистим звуком.",
    price: 12999,
    stock: 13,
    image: "accessory-coral",
    categoryName: "Аксесуари",
  },
];

async function main() {
  const password = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@techstore.local" },
    update: {
      name: "Admin",
      role: Role.ADMIN,
    },
    create: {
      name: "Admin",
      email: "admin@techstore.local",
      password,
      role: Role.ADMIN,
    },
  });

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  for (const product of products) {
    const category = await prisma.category.findUniqueOrThrow({
      where: { name: product.categoryName },
    });
    const existingProduct = await prisma.product.findFirst({
      where: { title: product.title },
    });
    const data = {
      title: product.title,
      description: product.description,
      price: product.price,
      stock: product.stock,
      image: product.image,
      categoryId: category.id,
    };

    if (existingProduct) {
      await prisma.product.update({
        where: { id: existingProduct.id },
        data,
      });
    } else {
      await prisma.product.create({ data });
    }
  }

  console.log("Database seeded successfully");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
