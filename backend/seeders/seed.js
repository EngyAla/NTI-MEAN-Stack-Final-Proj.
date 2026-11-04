require('dotenv').config();
const mongoose = require('mongoose');
const Manager = require('../models/Manager');
const Category = require('../models/Category');
const Item = require('../models/Item');
const Order = require('../models/Order');
const Translation = require('../models/Translation');
const translationsData = require('./translationsData');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nti-final-project';
    await mongoose.connect(mongoUri);
    console.log(`[Seed] Connected to MongoDB at: ${mongoUri}`);

    // 1. Seed Translations (Idempotent upsert)
    console.log('[Seed] Seeding UI translations (idempotent upsert)...');
    let translationUpsertCount = 0;
    for (const t of translationsData) {
      await Translation.updateOne(
        { key: t.key },
        { $set: { key: t.key, en: t.en, ar: t.ar } },
        { upsert: true }
      );
      translationUpsertCount++;
    }
    console.log(`[Seed] Successfully processed ${translationUpsertCount} UI translations in MongoDB.`);

    // 2. Seed Manager Account (Only if not existing)
    const managerEmail = (process.env.MANAGER_EMAIL || 'manager@aurelia.com').toLowerCase().trim();
    const managerPassword = process.env.MANAGER_PASSWORD || 'Manager@123456';
    const managerName = process.env.MANAGER_NAME || 'Aurelia Executive Manager';

    let manager = await Manager.findOne({ email: managerEmail });
    if (!manager) {
      console.log(`[Seed] Creating initial manager account for ${managerEmail}...`);
      manager = await Manager.create({
        name: managerName,
        email: managerEmail,
        password: managerPassword,
        role: 'manager',
      });
      console.log(`[Seed] Manager account created: ${manager.email}`);
    } else {
      console.log(`[Seed] Manager account already active: ${manager.email}`);
    }

    // 3. Seed Bilingual Categories (Idempotent upsert)
    console.log('[Seed] Seeding bilingual categories...');
    const categoriesData = [
      {
        name: {
          en: 'Handbags & Leathercraft',
          ar: 'حقائب اليد والمصنوعات الجلدية',
        },
        description: {
          en: 'Meticulously handcrafted bags and wallets sculpted from full-grain Tuscan calfskin.',
          ar: 'حقائب ومحافظ مصنوعة يدوياً بحرفية متقنة من جلد العجل الإيطالي الفاخر.',
        },
        imageUrl:
          'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80',
        image:
          'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80',
      },
      {
        name: {
          en: 'Fine Timepieces',
          ar: 'الساعات السويسرية الفاخرة',
        },
        description: {
          en: 'Swiss mechanical precision encased in brushed steel, champagne gold, and sapphire crystal.',
          ar: 'دقة ميكانيكية سويسرية مصاغة من الفولاذ المصقول والذهب والزجاج الياقوتي المقاوم للخدش.',
        },
        imageUrl:
          'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80',
        image:
          'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80',
      },
      {
        name: {
          en: 'Haute Joaillerie',
          ar: 'المجوهرات الراقية',
        },
        description: {
          en: 'Lustrous 18k gold vermeil, freshwater pearls, and sculptural gemstone adornments.',
          ar: 'ذهب عيار 18 قيراطاً، ولآلئ المياه العذبة النقية، وأحجار كريمة منحوتة بجمال خالد.',
        },
        imageUrl:
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80',
        image:
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80',
      },
      {
        name: {
          en: 'Designer Eyewear',
          ar: 'النظارات الشمسية الراقية',
        },
        description: {
          en: 'Custom Japanese acetate frames with premium polarized anti-reflective lenses.',
          ar: 'إطارات مخصصة من الأسيتات الياباني مع عدسات مستقطبة ومضادة للانعكاس.',
        },
        imageUrl:
          'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=80',
        image:
          'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=80',
      },
      {
        name: {
          en: 'Artisan Belts',
          ar: 'الأحزمة الجلدية الحرفية',
        },
        description: {
          en: 'Hand-burnished saddle leather straps completed with solid brushed brass hardware.',
          ar: 'أحزمة جلدية مدبوغة ومصقولة يدوياً مع إبزيم نحاسي فاخر.',
        },
        imageUrl:
          'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=1000&q=80',
        image:
          'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=1000&q=80',
      },
      {
        name: {
          en: 'Silk & Hair Accents',
          ar: 'الحرير وإكسسوارات الشعر',
        },
        description: {
          en: 'Pure 22-Momme mulberry silk scarves and gilded architectural hair barrettes.',
          ar: 'أوشحة من حرير التوت الطبيعي الخالص ومشاك الشعر المطلية بالذهب.',
        },
        imageUrl:
          'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1000&q=80',
        image:
          'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1000&q=80',
      },
    ];

    const catMap = {};
    for (const c of categoriesData) {
      const updatedCat = await Category.findOneAndUpdate(
        { 'name.en': c.name.en },
        { $set: c },
        { upsert: true, new: true }
      );
      catMap[c.name.en] = updatedCat._id;
    }
    console.log('[Seed] Bilingual categories ready.');

    // 4. Seed Bilingual Items (Strict accessories photography only - no human models or faces)
    console.log('[Seed] Seeding bilingual items...');
    const itemsData = [
      // Handbags & Leathercraft
      {
        name: {
          en: 'Palazzo Saffiano Leather Tote',
          ar: 'حقيبة بالازو توت من جلد سافيانو',
        },
        description: {
          en: 'Structured minimalist tote crafted from scratch-resistant Italian Saffiano calfskin. Features champagne gold hardware, dedicated laptop compartment, and dual magnetic closure.',
          ar: 'حقيبة توت أنيقة مصنوعة من جلد العجل الإيطالي المقاوم للخدش، مزودة بحليات معدنية بلون الذهب، وحجرة مخصصة للأجهزة الذكية.',
        },
        price: 495,
        quantity: 14,
        category: catMap['Handbags & Leathercraft'],
        imageUrl:
          'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80',
        image:
          'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80',
        images: [
          'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=80',
        ],
        material: {
          en: 'Tuscan Saffiano Calfskin / 18k Champagne Gold Hardware',
          ar: 'جلد عجل توسكاني سافيانو / حليات مطلية بذهب عيار 18',
        },
        dimensions: '38cm x 28cm x 14cm',
        isFeatured: true,
      },
      {
        name: {
          en: 'Siena Crescent Shoulder Bag',
          ar: 'حقيبة كتف سيينا الهلالية',
        },
        description: {
          en: 'Sculptural curved silhouette inspired by Roman architecture. Features a detachable crossbody strap, suede interior lining, and subtle engraved monogram stamp.',
          ar: 'تصميم منحوت مستوحى من العمارة الكلاسيكية، مزود بحزام كتف قابل للفصل وبطانة داخلية من الشمواه الفاخر.',
        },
        price: 380,
        quantity: 20,
        category: catMap['Handbags & Leathercraft'],
        imageUrl:
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80',
        image:
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80',
        images: [
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=1000&q=80',
        ],
        material: {
          en: 'Smooth Semi-Vegetable Tanned Leather',
          ar: 'جلد طبيعي مدبوغ نباتياً بملمس حريري ناعم',
        },
        dimensions: '26cm x 17cm x 7cm',
        isFeatured: true,
      },
      {
        name: {
          en: 'Atelier French Flap Wallet',
          ar: 'محفظة أتيليه الفرنسية القابلة للطي',
        },
        description: {
          en: 'Compact bi-fold wallet engineered for modern essentials. Eight dedicated card slots, zippered coin pouch with leather pull, and bill divider.',
          ar: 'محفظة مدمجة قابلة للطي مصممة للاستخدام اليومي، تحتوي على 8 فتحات للبطاقات وجيب للنقود المعدنية مع سحاب جلدي.',
        },
        price: 165,
        quantity: 35,
        category: catMap['Handbags & Leathercraft'],
        imageUrl:
          'https://images.unsplash.com/photo-1628149455678-16f37bc392f4?auto=format&fit=crop&w=1000&q=80',
        image:
          'https://images.unsplash.com/photo-1628149455678-16f37bc392f4?auto=format&fit=crop&w=1000&q=80',
        images: [
          'https://images.unsplash.com/photo-1628149455678-16f37bc392f4?auto=format&fit=crop&w=1000&q=80',
        ],
        material: {
          en: 'Grained French Chevre Goatskin',
          ar: 'جلد الماعز الفرنسي المحبب نخب أول',
        },
        dimensions: '12cm x 9.5cm x 2.5cm',
        isFeatured: false,
      },

      // Fine Timepieces
      {
        name: {
          en: 'Monaco Automatic Chronograph 39mm',
          ar: 'ساعة موناكو الأوتوماتيكية كرونوغراف 39 مم',
        },
        description: {
          en: 'Minimalist sunburst champagne dial with polished gold hour indices. Powered by an automatic 28,800 vph Swiss movement with a 42-hour power reserve.',
          ar: 'ميناء شمسي باللون الذهبي مع مؤشرات ساعات مصقولة. تعمل بحركة أوتوماتيكية سويسرية مع احتياطي طاقة 42 ساعة.',
        },
        price: 890,
        quantity: 8,
        category: catMap['Fine Timepieces'],
        imageUrl:
          'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80',
        image:
          'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80',
        images: [
          'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80',
        ],
        material: {
          en: '316L Surgical Stainless Steel / Sapphire Crystal',
          ar: 'فولاذ جراحي مقاوم للصدأ 316L / زجاج ياقوتي',
        },
        dimensions: 'Case Diameter: 39mm, Thickness: 9.8mm',
        isFeatured: true,
      },
      {
        name: {
          en: 'Geneva Classic Dress Watch',
          ar: 'ساعة جنيف الكلاسيكية الراقية',
        },
        description: {
          en: 'Slim ultra-thin silhouette with genuine midnight alligator-embossed leather strap. Crisp ivory dial with blued steel hands.',
          ar: 'هيكل فائق النحافة مع حزام جلدي فاخر، وميناء عاجي ناصع مع عقارب فولاذية زرقاء مذهلة.',
        },
        price: 640,
        quantity: 12,
        category: catMap['Fine Timepieces'],
        imageUrl:
          'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=1000&q=80',
        image:
          'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=1000&q=80',
        images: [
          'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=1000&q=80',
        ],
        material: {
          en: 'Champagne Gold PVD / Anti-Reflective Sapphire',
          ar: 'طلاء PVD ذهبي / زجاج ياقوت مضاد للانعكاس',
        },
        dimensions: 'Case Diameter: 38mm, Thickness: 6.8mm',
        isFeatured: false,
      },
      {
        name: {
          en: 'L’Etoile Diamond Dial Timepiece',
          ar: 'ساعة ليتوال المرصعة بالألماس',
        },
        description: {
          en: 'Delicate mother-of-pearl dial accented with conflict-free micro pavé indices and an interchangeable mesh gold bracelet.',
          ar: 'ميناء عرق اللؤلؤ الطبيعي مع مؤشرات ألماسية ناعمة وسوار شبكي ذهبي قابل للتبديل.',
        },
        price: 780,
        quantity: 10,
        category: catMap['Fine Timepieces'],
        imageUrl:
          'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=80',
        image:
          'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=80',
        images: [
          'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=80',
        ],
        material: {
          en: 'Mother-of-Pearl / 18k Rose Gold Plating',
          ar: 'عرق لؤلؤ طبيعي / طلاء ذهب وردي عيار 18',
        },
        dimensions: 'Case Diameter: 34mm, Thickness: 7.2mm',
        isFeatured: true,
      },

      // Haute Joaillerie
      {
        name: {
          en: 'Aurelia Baroque Pearl Pendant',
          ar: 'قلادة لؤلؤ الباروك من أوريليا',
        },
        description: {
          en: 'A singular organic baroque freshwater pearl suspended from a delicate 18k solid gold vermeil rope chain. Each pearl features unique iridescent luster.',
          ar: 'لؤلؤة باروكية طبيعية فريدة تتدلى من سلسلة رقيقة مطلية بذهب خالص عيار 18 قيراطاً.',
        },
        price: 290,
        quantity: 18,
        category: catMap['Haute Joaillerie'],
        imageUrl:
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80',
        image:
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80',
        images: [
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=80',
        ],
        material: {
          en: 'Grade-AAA Freshwater Pearl / 18k Gold Vermeil',
          ar: 'لؤلؤ طبيعي نخب AAA / فيرميل ذهب عيار 18',
        },
        dimensions: 'Chain Length: 45cm + 5cm Extender',
        isFeatured: true,
      },
      {
        name: {
          en: 'Duchess Ribbon Gold Hoop Earrings',
          ar: 'أقراط دوقة الحلقية الذهبية الملتفة',
        },
        description: {
          en: 'Tubular twisted gold hoops that capture light from every angle. Lightweight hollow construction designed for all-day comfortable wear.',
          ar: 'أقراط حلقية أنبوبية بتصميم ملتف يعكس الضوء ببريق مذهل. مصممة بوزن خفيف لراحة تدوم طوال اليوم.',
        },
        price: 210,
        quantity: 25,
        category: catMap['Haute Joaillerie'],
        imageUrl:
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80',
        image:
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80',
        images: [
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80',
        ],
        material: {
          en: '18k Gilded Sterling Silver 925',
          ar: 'فضة إسترلينية 925 مطلية بذهب عيار 18',
        },
        dimensions: 'Outer Diameter: 28mm, Width: 4.5mm',
        isFeatured: false,
      },
      {
        name: {
          en: 'Signet Heritage Solitaire Ring',
          ar: 'خاتم سيجنت التراثي المرصع بحجر السوليتير',
        },
        description: {
          en: 'Brushed matte gold signet ring featuring a bezel-set natural champagne quartz stone. Hand-finished by our master jewelers.',
          ar: 'خاتم سيجنت ذهبي غير لامع يتميز بحجر الكوارتز الشمباني الطبيعي، مصقول يدوياً بواسطة كبار صائغي المجوهرات.',
        },
        price: 245,
        quantity: 15,
        category: catMap['Haute Joaillerie'],
        imageUrl:
          'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80',
        image:
          'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80',
        images: [
          'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80',
        ],
        material: {
          en: 'Recycled Solid Silver / 2.5 Micron 18k Gold Plating',
          ar: 'فضة خالصة / طلاء ذهب عيار 18 بسماكة 2.5 ميكرون',
        },
        dimensions: 'Top Plate: 12mm x 10mm',
        isFeatured: true,
      },

      // Designer Eyewear
      {
        name: {
          en: 'Sorrento Polarized Tortoiseshell Sunglasses',
          ar: 'نظارات سورينتو الشمسية المستقطبة بنقشة التايجر',
        },
        description: {
          en: 'Hand-polished Mazzucchelli acetate in warm amber tortoiseshell. 100% UVA/UVB Category 3 nylon lenses with anti-reflective back coating.',
          ar: 'أسيتات مازوتشيلي مصقول يدوياً بلون الكهرمان الدافئ، مع عدسات نايلون فئة 3 حماية 100% من الأشعة فوق البنفسجية ومضادة للانعكاس.',
        },
        price: 280,
        quantity: 22,
        category: catMap['Designer Eyewear'],
        imageUrl:
          'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=80',
        image:
          'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=80',
        images: [
          'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=80',
        ],
        material: {
          en: 'Italian Mazzucchelli Acetate / Mineral Glass',
          ar: 'أسيتات مازوتشيلي إيطالي / زجاج معدني نقي',
        },
        dimensions: 'Lens: 51mm, Bridge: 20mm, Temple: 145mm',
        isFeatured: true,
      },
      {
        name: {
          en: 'Capri Titanium Aviator Frames',
          ar: 'إطارات كابري أفياتور من التيتانيوم الخالص',
        },
        description: {
          en: 'Featherlight Japanese titanium frame finished in warm champagne satin. Features flexible barrel hinges and silicone hypoallergenic nose pads.',
          ar: 'إطار خفيف للغاية من التيتانيوم الياباني الفاخر بلمسة ساتانية، مع مفصلات مرنة ودعامات أنف من السيليكون الطبي المقاوم للحساسية.',
        },
        price: 320,
        quantity: 16,
        category: catMap['Designer Eyewear'],
        imageUrl:
          'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=1000&q=80',
        image:
          'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=1000&q=80',
        images: [
          'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=1000&q=80',
        ],
        material: {
          en: 'Pure Japanese Beta-Titanium / Gradient Bronze Lens',
          ar: 'بيتا تيتانيوم ياباني نقي / عدسات برونزية متدرجة',
        },
        dimensions: 'Lens: 56mm, Bridge: 16mm, Temple: 140mm',
        isFeatured: false,
      },

      // Artisan Belts
      {
        name: {
          en: 'Venezia Saddle Leather Belt',
          ar: 'حزام فينيسيا من جلد السرج الفاخر',
        },
        description: {
          en: 'Hand-curried vegetable-tanned bridle leather with beveled and waxed edges. Accompanied by a solid cast brass buckle in aged champagne patina.',
          ar: 'جلد طبيعي مدبوغ نباتياً بحواف مشطوفة ومصقولة بالشمع، مزود بإبزيم نحاسي مصبوب بلمسة عتيقة مميزة.',
        },
        price: 175,
        quantity: 26,
        category: catMap['Artisan Belts'],
        imageUrl:
          'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=1000&q=80',
        image:
          'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=1000&q=80',
        images: [
          'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=1000&q=80',
        ],
        material: {
          en: 'Full-Grain Bridle Leather / Solid Brass Buckle',
          ar: 'جلد كامل الحبيبات / إبزيم نحاسي خالص',
        },
        dimensions: 'Width: 32mm / Adjustable 85cm - 110cm',
        isFeatured: false,
      },
      {
        name: {
          en: 'Milano Reversible Formal Belt',
          ar: 'حزام ميلانو الرسمي القابل للارتداء على الوجهين',
        },
        description: {
          en: 'Dual-sided luxury calfskin switching between Deep Espresso Brown and Midnight Onyx Black via a rotating brushed palladium buckle.',
          ar: 'جلد عجل فاخر بوجهين يتيح التبديل بين البني الداكن والأسود الملكي عبر إبزيم دوار من البلاديوم المصقول.',
        },
        price: 215,
        quantity: 19,
        category: catMap['Artisan Belts'],
        imageUrl:
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80',
        image:
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80',
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80',
        ],
        material: {
          en: 'Dual-Faced Italian Calfskin / Palladium Hardware',
          ar: 'جلد عجل إيطالي مزدوج / حليات بلاديوم فاخرة',
        },
        dimensions: 'Width: 35mm',
        isFeatured: false,
      },

      // Silk & Hair Accents
      {
        name: {
          en: 'L’Olympe 100% Silk Twill Scarf',
          ar: 'وشاح لوليمب من حرير التوت الخالص 100%',
        },
        description: {
          en: 'Hand-rolled hemmed 90cm square scarf printed in Como, Italy. Features subtle classical geometric motifs in champagne, cream, and rich espresso.',
          ar: 'وشاح مربع 90 سم بأطراف ملفوفة يدوياً، طُبع في كومو بإيطاليا بنقوش كلاسيكية بدرجات الشمبانيا والكريم والإسبريسو.',
        },
        price: 195,
        quantity: 24,
        category: catMap['Silk & Hair Accents'],
        imageUrl:
          'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1000&q=80',
        image:
          'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1000&q=80',
        images: [
          'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1000&q=80',
        ],
        material: {
          en: '100% Mulberry Silk Twill (18mm)',
          ar: 'حرير توت خالص 100% منسوج بنمط تويل (18 مم)',
        },
        dimensions: '90cm x 90cm Hand-Rolled Edges',
        isFeatured: true,
      },
      {
        name: {
          en: 'Aethel Sculpted Architectural Hair Claw',
          ar: 'مشبك شعر أيثل المعماري المطلي بالذهب',
        },
        description: {
          en: 'Heavyweight zinc alloy hair claw coated in high-gloss champagne gold. Strong stainless steel tension spring for effortless all-day hold without pulling.',
          ar: 'مشبك شعر مصنوع من سبائك الزنك المتينة ومطلي بذهب عالي اللمعان، مزود بنوابض فولاذية قوية لثبات مريح طوال اليوم.',
        },
        price: 85,
        quantity: 40,
        category: catMap['Silk & Hair Accents'],
        imageUrl:
          'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=80',
        image:
          'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=80',
        images: [
          'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=80',
        ],
        material: {
          en: 'Polished Zinc Alloy / Electroplated 18k Gold Finish',
          ar: 'سبيكة زنك مصقولة / طلاء كهربائي بذهب عيار 18',
        },
        dimensions: 'Length: 10.5cm, Height: 4.8cm',
        isFeatured: false,
      },
    ];

    for (const item of itemsData) {
      await Item.findOneAndUpdate(
        { 'name.en': item.name.en },
        { $set: item },
        { upsert: true, new: true }
      );
    }
    console.log(`[Seed] Processed ${itemsData.length} bilingual items with upsert.`);

    console.log('--------------------------------------------------');
    console.log('Database seeding & multilingual migration complete!');
    console.log(`UI Translations: ${translationUpsertCount} keys`);
    console.log(`Manager Credentials: ${managerEmail} / ${managerPassword}`);
    console.log('--------------------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
