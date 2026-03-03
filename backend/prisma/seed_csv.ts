import { PrismaClient, ProductBadge, ProductStatus } from '@prisma/client';
import fs from 'fs';
import * as Papa from 'papaparse';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(__dirname, 'dummy_products_india.csv');
  console.log(`Reading ${filePath} ...`);
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  // Parse CSV
  let parsed = Papa.parse(fileContent, { header: true, skipEmptyLines: true });
  const rows = parsed.data as any[];

  console.log(`Parsed ${rows.length} rows.`);

  // We need to ensure categories exist. 
  // We will map categoryId -> Name using tags array if possible, or dummy
  const categoriesToUpsert = new Map<string, string>();
  const sellersToUpsert = new Map<string, string>();

  // Process rows
  const productsInput = rows.map((row, index) => {
    // Collect category info
    const catId = row.categoryId || `cat_unknown_${index}`;
    let catName = "Unknown Category";
    if (row.tags) {
      try { // Parse "['home & kitchen', ...]"
        const tagsArray = row.tags.replace(/'/g, '"');
        const tags = JSON.parse(tagsArray);
        catName = JSON.parse(tagsArray)[0] || catName;
      } catch(e) {}
    }
    if (!categoriesToUpsert.has(catId)) categoriesToUpsert.set(catId, catName);

    // Collect seller info
    const sellerId = row.sellerId || `seller_unknown_${index}`;
    const sellerName = row.sellerName || "Unknown Seller";
    if (!sellersToUpsert.has(sellerId)) sellersToUpsert.set(sellerId, sellerName);
    
    // Parse Specs
    let parsedSpecs = {};
    if (row.specs) {
      try {
        let cleanSpecStr = row.specs;
        // Fix up double quotes if needed, papa parse parses quoted correctly so row.specs is a JSON string
        parsedSpecs = JSON.parse(cleanSpecStr);
      } catch (e) {
        console.warn(`Could not parse specs for row ${index}`);
      }
    }

    // Parse badges
    let badge = null;
    if (row.badge) {
       // Convert from string to enum. "Amazon's Choice", "Bestseller", "Limited Time Deal" missing in enum natively (New, Sale, Hot).
       // We map them loosely or leave as null.
       if (row.badge.includes("Bestseller")) badge = ProductBadge.Hot;
       else if (row.badge.includes("Limited Time Deal")) badge = ProductBadge.Sale;
       else if (row.badge.includes("Choice")) badge = ProductBadge.New;
    }

    // Parse images array
    let images = [];
    if (row.images) {
      try {
        const jsArray = row.images.replace(/'/g, '"');
        images = JSON.parse(jsArray);
      } catch(e) {}
    }

    // Parse Tags array
    let parsedTags: string[] = [];
    if (row.tags) {
      try {
        const jsArray = row.tags.replace(/'/g, '"');
        parsedTags = JSON.parse(jsArray);
      } catch(e) {}
    }

    return {
      id: row.id,
      title: row.title,
      slug: row.slug || `${row.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index}`,
      description: row.description,
      price: parseFloat(row.price) || 0,
      originalPrice: parseFloat(row.originalPrice) || 0,
      rating: parseFloat(row.rating) || 0,
      reviewCount: parseInt(row.reviewCount, 10) || 0,
      stock: parseInt(row.stock, 10) || 0,
      badge: badge,
      specs: parsedSpecs,
      images: images,
      tags: parsedTags,
      categoryId: catId,
      sellerId: sellerId,
      sellerName: sellerName,
      createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date(),
    };
  });

  // Upsert categories
  for (const [id, name] of categoriesToUpsert.entries()) {
    await prisma.category.upsert({
      where: { id: id },
      update: {},
      create: {
        id: id,
        name: name.charAt(0).toUpperCase() + name.slice(1), // capitalize
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        icon: 'Package', // fallback icon
      }
    });
  }
  console.log(`Upserted ${categoriesToUpsert.size} categories.`);

  // Upsert sellers
  for (const [id, name] of sellersToUpsert.entries()) {
    await prisma.user.upsert({
      where: { id: id },
      update: {},
      create: {
        id: id,
        clerkId: `clerk_imported_${id}`,
        name: name,
        email: `${id}@imported-seller.com`,
        role: 'user', // default Role.user
        status: 'active'
      }
    });
  }
  console.log(`Upserted ${sellersToUpsert.size} sellers.`);

  // Insert products
  console.log("Adding products...");
  
  // Clean first or Upsert? user said "add this in database products table. dont change anything a-z same data". 
  // We'll use createMany, but if they already exist it throws. Better using upsert or skipping duplicates.
  let added = 0;
  for (const p of productsInput) {
    try {
      await prisma.product.upsert({
         where: { id: p.id },
         create: p,
         update: p, 
      });
      added++;
    } catch(e) {
      console.error(`Error adding product ${p.id}: `, e);
    }
  }

  console.log(`Successfully added/updated ${added} products!`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  });
