import { PrismaClient, Role, UserStatus, ProductStatus, ProductBadge, OrderStatus, PaymentMethod, SaleStatus } from '@prisma/client';
import { fakerEN_IN as faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning database...");
  await prisma.faq.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Users (Admins and Sellers)
  const users = [];
  for (let i = 0; i < 20; i++) {
    const user = await prisma.user.create({
      data: {
        clerkId: `clerk_${faker.string.uuid()}`,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        role: i === 0 ? Role.admin : Role.user,
        avatar: faker.image.avatar(),
        phone: faker.phone.number(),
        status: UserStatus.active,
        addresses: {
          create: [{
            fullName: faker.person.fullName(),
            line1: faker.location.streetAddress(),
            city: faker.location.city(),
            state: faker.location.state(),
            zip: faker.location.zipCode(),
            country: "India",
            isDefault: true
          }]
        }
      }
    });
    users.push(user);
  }

  // 2. Categories
  const categoryData = [
    { name: 'Mobiles & Tablets', slug: 'mobiles', icon: 'Smartphone' },
    { name: 'Ethnic Wear', slug: 'ethnic-wear', icon: 'Shirt' },
    { name: 'Kitchen Appliances', slug: 'kitchen', icon: 'ChefHat' },
    { name: 'Groceries', slug: 'groceries', icon: 'ShoppingBasket' },
    { name: 'Audio & Wireless', slug: 'audio', icon: 'Headphones' },
  ];

  const categories = [];
  for (const cat of categoryData) {
    const createdCat = await prisma.category.create({ data: cat });
    categories.push(createdCat);
  }

  // 3. Generate 1000 Products
  console.log("Generating 1,000 products...");
  const productData = [];
  
  // Specific Indian Context Generators
  const indianBrands = {
    'mobiles': ['Samsung', 'Vivo', 'Nothing', 'iPhone', 'OnePlus', 'Realme'],
    'ethnic-wear': ['FabIndia', 'Biba', 'W for Woman', 'Manyavar', 'Kalki'],
    'kitchen': ['Prestige', 'Bajaj', 'Philips', 'Havells', 'Wonderchef'],
    'groceries': ['Tata Sampann', 'Aashirvaad', 'Fortune', 'Amul', 'Catch'],
    'audio': ['boAt', 'Noise', 'JBL', 'Sony', 'Sennheiser']
  };

  for (let i = 0; i < 1000; i++) {
    const category = faker.helpers.arrayElement(categories);
    const brandList = indianBrands[category.slug as keyof typeof indianBrands] || ['Generic'];
    const brand = faker.helpers.arrayElement(brandList);
    const title = `${brand} ${faker.commerce.productName()}`;
    
    const price = parseFloat(faker.commerce.price({ min: 100, max: 150000 }));
    
    productData.push({
      title: title,
      slug: `${faker.helpers.slugify(title).toLowerCase()}-${faker.string.nanoid(5)}`,
      description: faker.commerce.productDescription(),
      price: price,
      originalPrice: price + (price * 0.2),
      images: [faker.image.urlLoremFlickr({ category: 'technics' }), faker.image.urlLoremFlickr({ category: 'fashion' })],
      categoryId: category.id,
      tags: [brand, category.name, 'IndianMarket'],
      rating: faker.number.float({ min: 3.5, max: 5, fractionDigits: 1 }),
      reviewCount: faker.number.int({ min: 0, max: 500 }),
      stock: faker.number.int({ min: 0, max: 100 }),
      badge: faker.helpers.arrayElement([ProductBadge.New, ProductBadge.Hot, ProductBadge.Sale, null]),
      specs: { warranty: "1 Year", origin: "India", material: "Premium" },
      sellerId: faker.helpers.arrayElement(users).id,
      sellerName: brand,
    });
  }

  await prisma.product.createMany({ data: productData });

  // 4. Testimonials & FAQs
  await prisma.testimonial.createMany({
    data: Array.from({ length: 5 }).map(() => ({
      name: faker.person.fullName(),
      role: "Verified Buyer",
      quote: "Amazing service! The delivery to my city was prompt and the packaging was great.",
      rating: 5,
    }))
  });

  await prisma.faq.createMany({
    data: [
      { question: "Do you provide Pan-India delivery?", answer: "Yes, we deliver to over 19,000 pin codes across India.", sortOrder: 1 },
      { question: "Is GST invoice available?", answer: "Yes, all our products come with a valid GST tax invoice.", sortOrder: 2 },
    ]
  });

  // 5. Create a Few Demo Orders to test your schema
  const allProducts = await prisma.product.findMany({ take: 10 });
  const buyer = users[5];

  const order = await prisma.order.create({
    data: {
      userId: buyer.id,
      total: 45000.00,
      status: OrderStatus.processing,
      shippingAddress: {
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
        address: "123 Marine Drive"
      },
      items: {
        create: [
          {
            productId: allProducts[0].id,
            title: allProducts[0].title,
            image: allProducts[0].images[0],
            price: allProducts[0].price,
            quantity: 1
          }
        ]
      },
      statusHistory: {
        create: [{ status: OrderStatus.processing, note: "Order placed successfully" }]
      }
    }
  });

  console.log("Seeding complete! 🚀 Created 1,000 products, 20 users, and demo orders.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
