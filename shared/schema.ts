import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const anime = pgTable("anime", {
  id: integer("id").primaryKey(),
  malId: integer("mal_id").unique().notNull(),
  title: text("title").notNull(),
  englishTitle: text("english_title"),
  genres: text("genres").array().default([]),
  synopsis: text("synopsis"),
  imageUrl: text("image_url"),
  episodes: integer("episodes"),
  status: text("status"),
  aired: text("aired"),
  score: real("score"),
  scoredBy: integer("scored_by"),
  type: text("type"),
  year: integer("year"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const ratings = pgTable("ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  animeId: integer("anime_id").notNull().references(() => anime.id),
  userId: varchar("user_id").notNull().default("default-user"),
  rating: integer("rating").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertAnimeSchema = createInsertSchema(anime).omit({
  id: true,
  createdAt: true,
});

export const insertRatingSchema = createInsertSchema(ratings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAnime = z.infer<typeof insertAnimeSchema>;
export type Anime = typeof anime.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;
export type Rating = typeof ratings.$inferSelect;
