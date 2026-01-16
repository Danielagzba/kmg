import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Store daily celebrity selections (AI-curated)
  dailyCelebrities: defineTable({
    date: v.string(), // "2026-01-16"
    gameMode: v.string(), // "women" or "men"
    celebrities: v.array(v.object({
      id: v.number(),
      name: v.string(),
      imageUrl: v.string(),
      knownFor: v.string(),
    })),
    theme: v.optional(v.string()), // AI-generated theme explanation
    createdAt: v.number(),
  }).index("by_date_mode", ["date", "gameMode"]),

  // Store user votes
  votes: defineTable({
    date: v.string(),
    gameMode: v.string(), // "women" or "men"
visitorId: v.string(), // Anonymous visitor ID
    kiss: v.number(), // Celebrity ID
    marry: v.number(),
    destroy: v.number(),
    createdAt: v.number(),
  }).index("by_date_mode", ["date", "gameMode"])
    .index("by_visitor_date_mode", ["visitorId", "date", "gameMode"]),

  // Aggregate stats per celebrity per day
  dailyStats: defineTable({
    date: v.string(),
    gameMode: v.string(),
    celebrityId: v.number(),
    kissCount: v.number(),
    marryCount: v.number(),
    destroyCount: v.number(),
  }).index("by_date_mode_celebrity", ["date", "gameMode", "celebrityId"]),
});
