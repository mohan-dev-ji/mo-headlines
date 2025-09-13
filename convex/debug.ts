import { query } from "./_generated/server";

export const testConnection = query({
  handler: async (ctx) => {
    const categories = await ctx.db.query("categories").collect();
    return {
      message: "Connection working!",
      categoryCount: categories.length,
      categoryNames: categories.map(c => c.name),
      timestamp: Date.now()
    };
  },
});