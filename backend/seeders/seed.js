require('dotenv').config();
const mongoose = require('mongoose');
const Manager = require('../models/Manager');
const Category = require('../models/Category');
const Item = require('../models/Item');
const Order = require('../models/Order');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nti-final-project';
    await mongoose.connect(mongoUri);
    console.log(`[Seed] Connected to MongoDB at: ${mongoUri}`);

    // Clear existing collections
    console.log('[Seed] Clearing existing collections...');
    await Manager.deleteMany({});
    await Category.deleteMany({});
    await Item.deleteMany({});
    await Order.deleteMany({});

    // 1. Seed Manager
    const managerEmail = (process.env.MANAGER_EMAIL || 'manager@aurelia.com').toLowerCase().trim();
    const managerPassword = process.env.MANAGER_PASSWORD || 'Manager@123456';
    const managerName = process.env.MANAGER_NAME || 'Aurelia Executive Manager';

    const manager = await Manager.create({
      name: managerName,
      email: managerEmail,
      password: managerPassword,
      role: 'manager',
    });
    console.log(`[Seed] Manager account created: ${manager.email}`);

    // 2. Seed Categories
    console.log('[Seed] Seeding categories...');
    const categoriesData = [
      {
        name: 'Handbags & Leathercraft',
        description:
          'Meticulously handcrafted bags and wallets sculpted from full-grain Tuscan calfskin.',
        imageUrl:
          'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80',
      },
      {
        name: 'Fine Timepieces',
        description:
          'Swiss mechanical precision encased in brushed steel, champagne gold, and sapphire crystal.',
        imageUrl:
          'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80',
      },
      {
        name: 'Haute Joaillerie',
        description:
          'Lustrous 18k gold vermeil, freshwater pearls, and sculptural gemstone adornments.',
        imageUrl:
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80',
      },
      {
        name: 'Designer Eyewear',
        description:
          'Custom Japanese acetate frames with premium polarized anti-reflective lenses.',
        imageUrl:
          'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=80',
      },
      {
        name: 'Artisan Belts',
        description:
          'Hand-burnished saddle leather straps completed with solid brushed brass hardware.',
        imageUrl:
          'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=1000&q=80',
      },
      {
        name: 'Silk & Hair Accents',
        description:
          'Pure 22-Momme mulberry silk scarves and gilded architectural hair barrettes.',
        imageUrl:
          'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1000&q=80',
      },
    ];

    const createdCategories = await Category.insertMany(categoriesData);
    const catMap = {};
    createdCategories.forEach((cat) => {
      catMap[cat.name] = cat._id;
    });

    // 3. Seed Items (Pure accessories photography only - no human models or faces)
    console.log('[Seed] Seeding items...');
    const itemsData = [
      // Handbags & Leathercraft
      {
        name: 'Palazzo Saffiano Leather Tote',
        description:
          'Structured minimalist tote crafted from scratch-resistant Italian Saffiano calfskin. Features champagne gold hardware, dedicated laptop compartment, and dual magnetic closure.',
        price: 495,
        quantity: 14,
        category: catMap['Handbags & Leathercraft'],
        imageUrl:
          'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80',
        images: [
          'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=80',
        ],
        material: 'Tuscan Saffiano Calfskin / 18k Champagne Gold Hardware',
        dimensions: '38cm x 28cm x 14cm',
        isFeatured: true,
      },
      {
        name: 'Siena Crescent Shoulder Bag',
        description:
          'Sculptural curved silhouette inspired by Roman architecture. Features a detachable crossbody strap, suede interior lining, and subtle engraved monogram stamp.',
        price: 380,
        quantity: 20,
        category: catMap['Handbags & Leathercraft'],
        imageUrl:
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80',
        images: [
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=1000&q=80',
        ],
        material: 'Smooth Semi-Vegetable Tanned Leather',
        dimensions: '26cm x 17cm x 7cm',
        isFeatured: true,
      },
      {
        name: 'Atelier French Flap Wallet',
        description:
          'Compact bi-fold wallet engineered for modern essentials. Eight dedicated card slots, zippered coin pouch with leather pull, and bill divider.',
        price: 165,
        quantity: 35,
        category: catMap['Handbags & Leathercraft'],
        imageUrl:
          'https://images.unsplash.com/photo-1628149455678-16f37bc392f4?auto=format&fit=crop&w=1000&q=80',
        images: [
          'https://images.unsplash.com/photo-1628149455678-16f37bc392f4?auto=format&fit=crop&w=1000&q=80',
        ],
        material: 'Grained French Chevre Goatskin',
        dimensions: '12cm x 9.5cm x 2.5cm',
        isFeatured: false,
      },

      // Fine Timepieces
      {
        name: 'Monaco Automatic Chronograph 39mm',
        description:
          'Minimalist sunburst champagne dial with polished gold hour indices. Powered by an automatic 28,800 vph Swiss movement with a 42-hour power reserve.',
        price: 890,
        quantity: 8,
        category: catMap['Fine Timepieces'],
        imageUrl:
          'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80',
        images: [
          'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80',
        ],
        material: '316L Surgical Stainless Steel / Sapphire Crystal',
        dimensions: 'Case Diameter: 39mm, Thickness: 9.8mm',
        isFeatured: true,
      },
      {
        name: 'Geneva Classic Dress Watch',
        description:
          'Slim ultra-thin silhouette with genuine midnight alligator-embossed leather strap. Crisp ivory dial with blued steel hands.',
        price: 640,
        quantity: 12,
        category: catMap['Fine Timepieces'],
        imageUrl:
          'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=1000&q=80',
        images: [
          'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=1000&q=80',
        ],
        material: 'Champagne Gold PVD / Anti-Reflective Sapphire',
        dimensions: 'Case Diameter: 38mm, Thickness: 6.8mm',
        isFeatured: false,
      },
      {
        name: 'L’Etoile Diamond Dial Timepiece',
        description:
          'Delicate mother-of-pearl dial accented with conflict-free micro pavé indices and an interchangeable mesh gold bracelet.',
        price: 780,
        quantity: 10,
        category: catMap['Fine Timepieces'],
        imageUrl:
          'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=80',
        images: [
          'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=80',
        ],
        material: 'Mother-of-Pearl / 18k Rose Gold Plating',
        dimensions: 'Case Diameter: 34mm, Thickness: 7.2mm',
        isFeatured: true,
      },

      // Haute Joaillerie
      {
        name: 'Aurelia Baroque Pearl Pendant',
        description:
          'A singular organic baroque freshwater pearl suspended from a delicate 18k solid gold vermeil rope chain. Each pearl features unique iridescent luster.',
        price: 290,
        quantity: 18,
        category: catMap['Haute Joaillerie'],
        imageUrl:
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80',
        images: [
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=80',
        ],
        material: 'Grade-AAA Freshwater Pearl / 18k Gold Vermeil',
        dimensions: 'Chain Length: 45cm + 5cm Extender',
        isFeatured: true,
      },
      {
        name: 'Duchess Ribbon Gold Hoop Earrings',
        description:
          'Tubular twisted gold hoops that capture light from every angle. Lightweight hollow construction designed for all-day comfortable wear.',
        price: 210,
        quantity: 25,
        category: catMap['Haute Joaillerie'],
        imageUrl:
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80',
        images: [
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80',
        ],
        material: '18k Gilded Sterling Silver 925',
        dimensions: 'Outer Diameter: 28mm, Width: 4.5mm',
        isFeatured: false,
      },
      {
        name: 'Signet Heritage Solitaire Ring',
        description:
          'Brushed matte gold signet ring featuring a bezel-set natural champagne quartz stone. Hand-finished by our master jewelers.',
        price: 245,
        quantity: 15,
        category: catMap['Haute Joaillerie'],
        imageUrl:
          'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80',
        images: [
          'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80',
        ],
        material: 'Recycled Solid Silver / 2.5 Micron 18k Gold Plating',
        dimensions: 'Top Plate: 12mm x 10mm',
        isFeatured: true,
      },

      // Designer Eyewear
      {
        name: 'Sorrento Polarized Tortoiseshell Sunglasses',
        description:
          'Hand-polished Mazzucchelli acetate in warm amber tortoiseshell. 100% UVA/UVB Category 3 nylon lenses with anti-reflective back coating.',
        price: 280,
        quantity: 22,
        category: catMap['Designer Eyewear'],
        imageUrl:
          'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=80',
        images: [
          'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=80',
        ],
        material: 'Italian Mazzucchelli Acetate / Mineral Glass',
        dimensions: 'Lens: 51mm, Bridge: 20mm, Temple: 145mm',
        isFeatured: true,
      },
      {
        name: 'Capri Titanium Aviator Frames',
        description:
          'Featherlight Japanese titanium frame finished in warm champagne satin. Features flexible barrel hinges and silicone hypoallergenic nose pads.',
        price: 320,
        quantity: 16,
        category: catMap['Designer Eyewear'],
        imageUrl:
          'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=1000&q=80',
        images: [
          'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=1000&q=80',
        ],
        material: 'Pure Japanese Beta-Titanium / Gradient Bronze Lens',
        dimensions: 'Lens: 56mm, Bridge: 16mm, Temple: 140mm',
        isFeatured: false,
      },

      // Artisan Belts
      {
        name: 'Venezia Saddle Leather Belt',
        description:
          'Hand-curried vegetable-tanned bridle leather with beveled and waxed edges. Accompanied by a solid cast brass buckle in aged champagne patina.',
        price: 175,
        quantity: 26,
        category: catMap['Artisan Belts'],
        imageUrl:
          'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=1000&q=80',
        images: [
          'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=1000&q=80',
        ],
        material: 'Full-Grain Bridle Leather / Solid Brass Buckle',
        dimensions: 'Width: 32mm / Adjustable 85cm - 110cm',
        isFeatured: false,
      },
      {
        name: 'Milano Reversible Formal Belt',
        description:
          'Dual-sided luxury calfskin switching between Deep Espresso Brown and Midnight Onyx Black via a rotating brushed palladium buckle.',
        price: 215,
        quantity: 19,
        category: catMap['Artisan Belts'],
        imageUrl:
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80',
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80',
        ],
        material: 'Dual-Faced Italian Calfskin / Palladium Hardware',
        dimensions: 'Width: 35mm',
        isFeatured: false,
      },

      // Silk & Hair Accents
      {
        name: 'L’Olympe 100% Silk Twill Scarf',
        description:
          'Hand-rolled hemmed 90cm square scarf printed in Como, Italy. Features subtle classical geometric motifs in champagne, cream, and rich espresso.',
        price: 195,
        quantity: 24,
        category: catMap['Silk & Hair Accents'],
        imageUrl:
          'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1000&q=80',
        images: [
          'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1000&q=80',
        ],
        material: '100% Mulberry Silk Twill (18mm)',
        dimensions: '90cm x 90cm Hand-Rolled Edges',
        isFeatured: true,
      },
      {
        name: 'Aethel Sculpted Architectural Hair Claw',
        description:
          'Heavyweight zinc alloy hair claw coated in high-gloss champagne gold. Strong stainless steel tension spring for effortless all-day hold without pulling.',
        price: 85,
        quantity: 40,
        category: catMap['Silk & Hair Accents'],
        imageUrl:
          'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=80',
        images: [
          'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=80',
        ],
        material: 'Polished Zinc Alloy / Electroplated 18k Gold Finish',
        dimensions: 'Length: 10.5cm, Height: 4.8cm',
        isFeatured: false,
      },
    ];

    const createdItems = await Item.insertMany(itemsData);
    console.log(`[Seed] Successfully seeded ${createdItems.length} accessories items.`);

    // 4. Seed initial sample orders for manager dashboard demonstration
    console.log('[Seed] Seeding initial sample orders...');
    const item1 = createdItems[0];
    const item2 = createdItems[3];
    const item3 = createdItems[6];

    const sampleOrders = [
      {
        orderNumber: 'AUR-2026-10492',
        customer: {
          fullName: 'Eleanor Vance',
          phone: '+1 (555) 234-8891',
          address: '742 Evergreen Terrace, Suite 4B, New York, NY 10021',
          notes: 'Please ring bell 4B or leave with doorman.',
        },
        items: [
          {
            item: item1._id,
            name: item1.name,
            price: item1.price,
            quantity: 1,
            subtotal: item1.price * 1,
            imageUrl: item1.imageUrl,
          },
          {
            item: item3._id,
            name: item3.name,
            price: item3.price,
            quantity: 1,
            subtotal: item3.price * 1,
            imageUrl: item3.imageUrl,
          },
        ],
        totalPrice: item1.price * 1 + item3.price * 1,
        status: 'opened',
        internalNotes: 'Client called on Oct 30. Delivery requested for Thursday afternoon.',
      },
      {
        orderNumber: 'AUR-2026-09821',
        customer: {
          fullName: 'Julian Sterling',
          phone: '+1 (555) 890-4412',
          address: '1200 Lake Shore Drive, Apt 18A, Chicago, IL 60611',
          notes: 'Gift wrapping requested if possible.',
        },
        items: [
          {
            item: item2._id,
            name: item2.name,
            price: item2.price,
            quantity: 1,
            subtotal: item2.price * 1,
            imageUrl: item2.imageUrl,
          },
        ],
        totalPrice: item2.price * 1,
        status: 'closed',
        internalNotes: 'Order verified by phone, packaged in signature ribbon box, delivered.',
      },
    ];

    await Order.insertMany(sampleOrders);
    console.log('[Seed] Successfully seeded 2 sample orders.');

    console.log('--------------------------------------------------');
    console.log('Database seeding completed successfully!');
    console.log(`Manager Credentials:`);
    console.log(`  Email:    ${managerEmail}`);
    console.log(`  Password: ${managerPassword}`);
    console.log('--------------------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
