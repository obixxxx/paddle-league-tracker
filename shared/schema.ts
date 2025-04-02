import { pgTable, text, serial, integer, boolean, date, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Players table
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  active: boolean("active").notNull().default(true),
  elo: integer("elo").notNull().default(1500),
  wins: integer("wins"),
  losses: integer("losses"),
  gamesPlayed: integer("games_played"),
  pointsFor: integer("points_for"),
  pointsAgainst: integer("points_against"),
  pointDiff: integer("point_diff"),
  winPercentage: text("win_percentage"),
  powerRanking: integer("power_ranking")
});

export const insertPlayerSchema = createInsertSchema(players).pick({
  name: true,
  active: true,
  elo: true
});

// Matches table
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  playerA1: text("player_a1").notNull(),
  playerA2: text("player_a2").notNull(),
  playerB1: text("player_b1").notNull(),
  playerB2: text("player_b2").notNull(),
  scoreA: integer("score_a").notNull(),
  scoreB: integer("score_b").notNull(),
  eloChangeA1: integer("elo_change_a1").notNull(),
  eloChangeA2: integer("elo_change_a2").notNull(),
  eloChangeB1: integer("elo_change_b1").notNull(),
  eloChangeB2: integer("elo_change_b2").notNull()
});

export const insertMatchSchema = createInsertSchema(matches).pick({
  date: true,
  playerA1: true,
  playerA2: true,
  playerB1: true,
  playerB2: true,
  scoreA: true,
  scoreB: true,
  eloChangeA1: true,
  eloChangeA2: true,
  eloChangeB1: true,
  eloChangeB2: true
});

// Partnerships table
export const partnerships = pgTable("partnerships", {
  id: serial("id").primaryKey(),
  partnershipId: text("partnership_id").notNull().unique(),
  player1: text("player1").notNull(),
  player2: text("player2").notNull(),
  gamesPlayed: integer("games_played").notNull().default(0),
  wins: integer("wins").notNull().default(0),
  losses: integer("losses").notNull().default(0),
  pointsFor: integer("points_for").notNull().default(0),
  pointsAgainst: integer("points_against").notNull().default(0),
  pointDiff: integer("point_diff").notNull().default(0),
  winPercentage: text("win_percentage"),
  chemistryRating: text("chemistry_rating"),
  elo: integer("elo").notNull().default(1500)
});

export const insertPartnershipSchema = createInsertSchema(partnerships).pick({
  partnershipId: true,
  player1: true,
  player2: true,
  gamesPlayed: true,
  wins: true,
  losses: true,
  pointsFor: true,
  pointsAgainst: true,
  pointDiff: true,
  winPercentage: true,
  chemistryRating: true,
  elo: true
});

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;

export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matches.$inferSelect;

export type InsertPartnership = z.infer<typeof insertPartnershipSchema>;
export type Partnership = typeof partnerships.$inferSelect;
