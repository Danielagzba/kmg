import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get daily celebrities
export const getDailyCelebrities = query({
  args: {
    date: v.string(),
    gameMode: v.string(),
  },
  handler: async (ctx, args) => {
    const daily = await ctx.db
      .query("dailyCelebrities")
      .withIndex("by_date_mode", (q) =>
        q.eq("date", args.date).eq("gameMode", args.gameMode)
      )
      .first();

    return daily;
  },
});

// Store daily celebrities (called from API after AI selection)
export const storeDailyCelebrities = mutation({
  args: {
    date: v.string(),
    gameMode: v.string(),
    celebrities: v.array(v.object({
      id: v.number(),
      name: v.string(),
      imageUrl: v.string(),
      knownFor: v.string(),
    })),
    theme: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if already exists
    const existing = await ctx.db
      .query("dailyCelebrities")
      .withIndex("by_date_mode", (q) =>
        q.eq("date", args.date).eq("gameMode", args.gameMode)
      )
      .first();

    if (existing) {
      return existing._id;
    }

    const id = await ctx.db.insert("dailyCelebrities", {
      date: args.date,
      gameMode: args.gameMode,
      celebrities: args.celebrities,
      theme: args.theme,
      createdAt: Date.now(),
    });

    return id;
  },
});
