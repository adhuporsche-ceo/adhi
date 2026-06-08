import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean database
  await prisma.payment.deleteMany({});
  await prisma.queue.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.favorite.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.loyaltyPoint.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.food.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.staff.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.user.deleteMany({});

  // Hashes
  const adminHash = await bcrypt.hash('Admin@123', 10);
  const staffHash = await bcrypt.hash('Kitchen@123', 10);
  const studentHash = await bcrypt.hash('Student@123', 10);

  // 1. Create Users
  await prisma.user.create({
    data: {
      name: 'KORE Canteen Manager',
      email: 'admin@kore.com',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  });

  const staffUser = await prisma.user.create({
    data: {
      name: 'Chef Rajesh',
      email: 'kitchen@kore.com',
      passwordHash: staffHash,
      role: 'STAFF',
    },
  });

  const studentUser = await prisma.user.create({
    data: {
      name: 'Adhithya Prasad',
      email: 'student@kore.com',
      passwordHash: studentHash,
      role: 'STUDENT',
    },
  });

  // Create Staff entry
  await prisma.staff.create({
    data: {
      userId: staffUser.id,
      isAvailable: true,
    },
  });

  // Create Student entry
  await prisma.student.create({
    data: {
      userId: studentUser.id,
      loyaltyPoints: 120,
    },
  });

  console.log('Users created successfully!');

  // 2. Create Categories
  const burgersCat = await prisma.category.create({ data: { name: 'Burgers' } });
  const pizzasCat = await prisma.category.create({ data: { name: 'Pizzas' } });
  const mealsCat = await prisma.category.create({ data: { name: 'Meals & Mains' } });
  const drinksCat = await prisma.category.create({ data: { name: 'Beverages' } });
  const dessertsCat = await prisma.category.create({ data: { name: 'Desserts' } });

  // 3. Create Foods
  // Burgers
  await prisma.food.createMany({
    data: [
      {
        name: 'Classic Veg Burger',
        description: 'Crispy veggie patty with fresh lettuce, tomatoes, and chef special sauce.',
        price: 80,
        imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=60',
        preparationTime: 8,
        categoryId: burgersCat.id,
      },
      {
        name: 'Spicy Chicken Burger',
        description: 'Juicy fried chicken breast topped with hot sauce, cheese, and pickles.',
        price: 120,
        imageUrl: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500&auto=format&fit=crop&q=60',
        preparationTime: 10,
        categoryId: burgersCat.id,
      },
      {
        name: 'Ultimate Cheese Blast Burger',
        description: 'Double patty burger with double cheese slice and oozing melted cheddar core.',
        price: 150,
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60',
        preparationTime: 12,
        categoryId: burgersCat.id,
      },
    ],
  });

  // Pizzas
  await prisma.food.createMany({
    data: [
      {
        name: 'Margherita Pizza (Personal)',
        description: 'Fresh mozzarella cheese, basil, and san marzano tomato sauce on crisp crust.',
        price: 160,
        imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&auto=format&fit=crop&q=60',
        preparationTime: 12,
        categoryId: pizzasCat.id,
      },
      {
        name: 'Farmhouse Pizza (Personal)',
        description: 'Loaded with baby corn, olives, bell peppers, onions, and mushrooms.',
        price: 220,
        imageUrl: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=500&auto=format&fit=crop&q=60',
        preparationTime: 15,
        categoryId: pizzasCat.id,
      },
    ],
  });

  // Meals
  await prisma.food.createMany({
    data: [
      {
        name: 'North Indian Special Thali',
        description: 'Paneer sabzi, Dal makhani, 2 Butter rotis, Jeera rice, Papad, and Sweet.',
        price: 130,
        imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60',
        preparationTime: 10,
        categoryId: mealsCat.id,
      },
      {
        name: 'Chicken Biryani Plate',
        description: 'Aromatic basmati rice cooked with tender chicken pieces, saffron, and biryani spices, served with raita.',
        price: 160,
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60',
        preparationTime: 7,
        categoryId: mealsCat.id,
      },
      {
        name: 'Paneer Butter Masala Combo',
        description: 'Rich paneer butter masala gravy served with 2 pieces of garlic naan or basmati rice.',
        price: 140,
        imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60',
        preparationTime: 9,
        categoryId: mealsCat.id,
      },
    ],
  });

  // Beverages
  await prisma.food.createMany({
    data: [
      {
        name: 'Lemon Iced Tea',
        description: 'Refreshing brewed tea served chilled with fresh mint and lemon slices.',
        price: 50,
        imageUrl: 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=500&auto=format&fit=crop&q=60',
        preparationTime: 3,
        categoryId: drinksCat.id,
      },
      {
        name: 'Signature Cold Coffee',
        description: 'Creamy cold brewed coffee blended with chocolate syrup and vanilla ice cream.',
        price: 70,
        imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=60',
        preparationTime: 4,
        categoryId: drinksCat.id,
      },
    ],
  });

  // Desserts
  await prisma.food.createMany({
    data: [
      {
        name: 'Chocolate Molten Lava Cake',
        description: 'Warm chocolate cake with a rich liquid chocolate center, served hot.',
        price: 90,
        imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=60',
        preparationTime: 6,
        categoryId: dessertsCat.id,
      },
    ],
  });

  // 4. Create Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: 'KORE20',
        discountPercent: 20,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        code: 'FRESHERS30',
        discountPercent: 30,
        expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('Food and categories seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
