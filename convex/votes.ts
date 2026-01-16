import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Submit a vote
export const submitVote = mutation({
  args: {
    date: v.string(),
    gameMode: v.string(),
    visitorId: v.string(),
    kiss: v.number(),
    marry: v.number(),
    destroy: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if user already voted for this date/mode
    const existing = await ctx.db
      .query("votes")
      .withIndex("by_visitor_date_mode", (q) =>
        q.eq("visitorId", args.visitorId).eq("date", args.date).eq("gameMode", args.gameMode)
      )
      .first();

    if (existing) {
      // Return existing vote ID if already voted
      return { voteId: existing._id, alreadyVoted: true };
    }

    // Save the vote
    const voteId = await ctx.db.insert("votes", {
      date: args.date,
      gameMode: args.gameMode,
      visitorId: args.visitorId,
      kiss: args.kiss,
      marry: args.marry,
      destroy: args.destroy,
      createdAt: Date.now(),
    });

    // Update stats for each celebrity
    const updates = [
      { celebrityId: args.kiss, field: "kissCount" as const },
      { celebrityId: args.marry, field: "marryCount" as const },
      { celebrityId: args.destroy, field: "destroyCount" as const },
    ];

    for (const update of updates) {
      const existingStats = await ctx.db
        .query("dailyStats")
        .withIndex("by_date_mode_celebrity", (q) =>
          q.eq("date", args.date).eq("gameMode", args.gameMode).eq("celebrityId", update.celebrityId)
        )
        .first();

      if (existingStats) {
        await ctx.db.patch(existingStats._id, {
          [update.field]: existingStats[update.field] + 1,
        });
      } else {
        await ctx.db.insert("dailyStats", {
          date: args.date,
          gameMode: args.gameMode,
          celebrityId: update.celebrityId,
          kissCount: update.field === "kissCount" ? 1 : 0,
          marryCount: update.field === "marryCount" ? 1 : 0,
          destroyCount: update.field === "destroyCount" ? 1 : 0,
        });
      }
    }

    return { voteId, alreadyVoted: false };
  },
});

// Get stats for a specific day and game mode
export const getStats = query({
  args: {
    date: v.string(),
    gameMode: v.string(),
  },
  handler: async (ctx, args) => {
    const stats = await ctx.db
      .query("dailyStats")
      .withIndex("by_date_mode_celebrity", (q) =>
        q.eq("date", args.date).eq("gameMode", args.gameMode)
      )
      .collect();

    // Get total vote count
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_date_mode", (q) =>
        q.eq("date", args.date).eq("gameMode", args.gameMode)
      )
      .collect();

    return {
      totalVotes: votes.length,
      stats: stats.reduce((acc, stat) => {
        acc[stat.celebrityId] = {
          kiss: stat.kissCount,
          marry: stat.marryCount,
          destroy: stat.destroyCount,
        };
        return acc;
      }, {} as Record<number, { kiss: number; marry: number; destroy: number }>),
    };
  },
});

// Check if user has voted
export const getUserVote = query({
  args: {
    date: v.string(),
    gameMode: v.string(),
    visitorId: v.string(),
  },
  handler: async (ctx, args) => {
    const vote = await ctx.db
      .query("votes")
      .withIndex("by_visitor_date_mode", (q) =>
        q.eq("visitorId", args.visitorId).eq("date", args.date).eq("gameMode", args.gameMode)
      )
      .first();

    return vote;
  },
});
