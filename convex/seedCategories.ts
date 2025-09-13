import { mutation } from "./_generated/server";
import { v } from "convex/values";

// ADR 4: Simplified 3-category system with balanced keyword distribution for RSS filtering
const PREDEFINED_CATEGORIES = [
  {
    name: "Tech & Science",
    slug: "tech-science",
    keywords: [
      // AI/ML (from AI category)
      "artificial intelligence",
      "ai",
      "AGI",
      "machine learning", 
      "neural network",
      "deep learning",
      "large language model",
      "llm",
      "chatbot",
      "generative ai",
      "computer vision",
      "natural language processing",
      // Big Tech companies
      "apple",
      "google",
      "microsoft", 
      "amazon",
      "meta",
      "netflix",
      "nvidia",
      "openai",
      "anthropic",
      "perplexity",
      "deepmind",
      "deepseek",
      "alibaba",
      "tencent",
      "baidu",
      "bytedance",
      "tiktok",
      "twitter",
      "x",
      "instagram",
      "facebook",
      "snapchat",
      "linkedin",
      // Science & Research
      "science",
      "breakthrough",
      "research",
      "study",
      "discovery",
      "clinical trial",
      "peer review",
      "laboratory",
      "experiment",
      "innovation",
      "scientific",
      "biotech",
      "cure",
      // Tech-focused Transport
      "tesla",
      "electric vehicles",
      "evs",
      "battery",
      "autonomous driving",
      "self-driving",
      "robotaxi",
      "lithium",
      "charging station",
      // Additional tech terms
      "semiconductor",
      "quantum computing",
      "cloud computing",
      "cybersecurity",
      "blockchain",
      "cryptocurrency",
      "software",
      "hardware",
      "5g",
      "internet of things",
      "iot"
    ]
  },
  {
    name: "Finance",
    slug: "finance",
    keywords: [
      // Startup/Investment (from Startups category)
      "startup",
      "funding",
      "venture capital",
      "series a",
      "series b", 
      "seed funding",
      "ipo",
      "acquisition",
      "merger",
      "unicorn",
      "valuation",
      // Traditional Finance
      "stock market",
      "stocks",
      "bonds",
      "investment",
      "portfolio",
      "dividend",
      "earnings",
      "revenue",
      "profit",
      "market cap",
      "trading",
      "exchange",
      "nasdaq",
      "s&p 500",
      "dow jones",
      "bull market",
      "bear market",
      "recession",
      "inflation",
      "interest rates",
      "federal reserve",
      "fed",
      "central bank",
      "monetary policy",
      "fiscal policy",
      "gdp",
      "economic growth",
      "employment",
      "unemployment",
      "consumer spending",
      // Fintech
      "fintech",
      "digital banking",
      "mobile payments",
      "payment processing",
      "cryptocurrency exchange",
      "defi",
      "decentralized finance",
      "nft",
      "bitcoin",
      "ethereum",
      "stablecoin",
      "wallet",
      "trading platform",
      "robo advisor",
      "peer-to-peer lending",
      "crowdfunding",
      "insurtech",
      "regtech",
      // Business Finance
      "corporate earnings",
      "quarterly results",
      "financial statement",
      "cash flow",
      "debt",
      "equity",
      "leverage",
      "working capital",
      "capex",
      "opex",
      "ebitda",
      "pe ratio",
      "market share",
      "competitive advantage",
      "business model"
    ]
  },
  {
    name: "Policies",
    slug: "policies",
    keywords: [
      // Transport Policy (from Transport category)
      "electric car",
      "range anxiety",
      "uber",
      "zenzic uk",
      "transport policy",
      "emissions standards",
      "carbon credits",
      "fuel efficiency",
      "public transport",
      "infrastructure",
      "road safety",
      "traffic regulations",
      "parking policy",
      "congestion charging",
      "clean air zones",
      // Government & Regulatory
      "regulation",
      "regulatory",
      "government",
      "policy",
      "legislation",
      "law",
      "congress",
      "senate",
      "house of representatives",
      "parliament",
      "fda",
      "fcc",
      "sec",
      "ftc",
      "doj",
      "antitrust",
      "monopoly",
      "competition",
      "consumer protection",
      "data privacy",
      "gdpr",
      "ccpa",
      "privacy law",
      "cybersecurity law",
      "ai governance",
      "ai regulation",
      "tech regulation",
      "content moderation",
      "social media regulation",
      "section 230",
      // International Policy
      "trade policy",
      "tariffs",
      "sanctions",
      "export controls",
      "international trade",
      "wto",
      "brexit",
      "china policy",
      "russia sanctions",
      "diplomatic relations",
      "geopolitics",
      "national security",
      "defense policy",
      "military",
      "nato",
      // Environmental Policy
      "climate policy",
      "carbon tax",
      "renewable energy",
      "solar incentives",
      "wind power",
      "green new deal",
      "paris agreement",
      "cop28",
      "sustainability",
      "esg",
      "carbon neutral",
      "net zero",
      "environmental protection",
      "epa",
      // Social Policy
      "healthcare policy",
      "education policy",
      "immigration",
      "tax policy",
      "social security",
      "medicare",
      "medicaid",
      "welfare",
      "minimum wage",
      "labor law",
      "employment law",
      "civil rights",
      "voting rights"
    ]
  }
];

export const seedCategories = mutation({
  args: {
    force: v.optional(v.boolean()), // Safety flag to prevent accidental runs
  },
  handler: async (ctx, args) => {
    if (!args.force) {
      throw new Error("Must set force: true to run seed script. This will replace all existing categories.");
    }

    console.log("Starting enhanced category seeding with keywords...");

    // Get existing categories
    const existingCategories = await ctx.db.query("categories").collect();
    const existingSlugs = new Set(existingCategories.map(c => c.slug));
    const predefinedSlugs = new Set(PREDEFINED_CATEGORIES.map(c => c.slug));

    let createdCount = 0;
    let updatedCount = 0;
    let deactivatedCount = 0;

    // Create or update predefined categories
    for (const category of PREDEFINED_CATEGORIES) {
      if (existingSlugs.has(category.slug)) {
        // Update existing category with new keywords and set active
        const existingCategory = existingCategories.find(c => c.slug === category.slug);
        if (existingCategory) {
          await ctx.db.patch(existingCategory._id, { 
            name: category.name,
            keywords: category.keywords,
            isActive: true,
            updatedAt: Date.now()
          });
          console.log(`Updated existing category: ${category.name} with ${category.keywords.length} keywords`);
          updatedCount++;
        }
        continue;
      }

      const categoryId = await ctx.db.insert("categories", {
        name: category.name,
        slug: category.slug,
        keywords: category.keywords,
        isActive: true,
        updatedAt: Date.now()
      });

      console.log(`Created category: ${category.name} with keywords: ${category.keywords.join(', ')} (${categoryId})`);
      createdCount++;
    }

    // Deactivate categories not in predefined list
    for (const existingCategory of existingCategories) {
      if (!predefinedSlugs.has(existingCategory.slug)) {
        await ctx.db.patch(existingCategory._id, { 
          isActive: false,
          updatedAt: Date.now()
        });
        console.log(`Deactivated category: ${existingCategory.name}`);
        deactivatedCount++;
      }
    }

    console.log(`Enhanced seeding complete. Created: ${createdCount}, Updated: ${updatedCount}, Deactivated: ${deactivatedCount}`);
    
    return {
      success: true,
      created: createdCount,
      updated: updatedCount,
      deactivated: deactivatedCount,
      total: PREDEFINED_CATEGORIES.length,
      categories: PREDEFINED_CATEGORIES.map(c => ({
        name: c.name,
        slug: c.slug,
        keywordCount: c.keywords.length
      }))
    };
  },
});

export const clearAllCategories = mutation({
  args: {
    confirm: v.literal("DELETE_ALL_CATEGORIES"), // Extra safety
  },
  handler: async (ctx, args) => {
    console.log("Clearing all categories...");
    
    const categories = await ctx.db.query("categories").collect();
    let deletedCount = 0;

    for (const category of categories) {
      await ctx.db.delete(category._id);
      deletedCount++;
    }

    console.log(`Deleted ${deletedCount} categories`);
    
    return {
      success: true,
      deleted: deletedCount
    };
  },
});

export const resetCategories = mutation({
  args: {
    confirm: v.literal("RESET_ALL_CATEGORIES"), // Extra safety
  },
  handler: async (ctx, args) => {
    console.log("Resetting all categories with enhanced keywords...");

    // First clear all existing categories
    const categories = await ctx.db.query("categories").collect();
    let deletedCount = 0;

    for (const category of categories) {
      await ctx.db.delete(category._id);
      deletedCount++;
    }

    console.log(`Deleted ${deletedCount} categories`);

    // Then seed new categories with keywords
    let createdCount = 0;

    for (const category of PREDEFINED_CATEGORIES) {
      const categoryId = await ctx.db.insert("categories", {
        name: category.name,
        slug: category.slug,
        keywords: category.keywords,
        isActive: true,
        updatedAt: Date.now()
      });

      console.log(`Created category: ${category.name} with ${category.keywords.length} keywords (${categoryId})`);
      createdCount++;
    }

    console.log("Enhanced category reset complete");
    
    return {
      success: true,
      deleted: deletedCount,
      created: createdCount,
      total: PREDEFINED_CATEGORIES.length
    };
  },
});

// Import categories directly (paste your dev data here)
export const importDevCategories = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("Starting direct category import from dev data...");
    
    // Paste your categories data from dev_data_export.json here
    const devCategories: any[] = [
      // PASTE YOUR CATEGORIES DATA HERE
    ];
    
    let importedCount = 0;
    
    for (const category of devCategories) {
      try {
        await ctx.db.insert("categories", {
          name: category.name,
          slug: category.slug,
          keywords: category.keywords || [],
          isActive: category.isActive !== false,
          updatedAt: Date.now(),
        });
        
        console.log(`Imported category: ${category.name}`);
        importedCount++;
      } catch (error) {
        console.error(`Failed to import category ${category.name}:`, error);
      }
    }
    
    console.log(`Import complete. Imported ${importedCount} categories.`);
    return { success: true, imported: importedCount };
  },
});

// Helper function to get category keywords for RSS filtering
export const getCategoryKeywords = mutation({
  args: {
    categorySlug: v.string(),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db
      .query("categories")
      .filter(q => q.and(
        q.eq(q.field("slug"), args.categorySlug),
        q.eq(q.field("isActive"), true)
      ))
      .first();

    if (!category) {
      throw new Error(`Category not found: ${args.categorySlug}`);
    }

    return {
      name: category.name,
      slug: category.slug,
      keywords: category.keywords || []
    };
  },
});