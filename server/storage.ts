import { type Anime, type InsertAnime, type Rating, type InsertRating } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Anime operations
  getAnime(): Promise<Anime[]>;
  getAnimeById(id: number): Promise<Anime | undefined>;
  getAnimeByMalId(malId: number): Promise<Anime | undefined>;
  createAnime(anime: InsertAnime): Promise<Anime>;
  updateAnime(id: number, anime: Partial<InsertAnime>): Promise<Anime | undefined>;
  searchAnime(query: string): Promise<Anime[]>;
  filterAnime(filters: {
    genre?: string;
    minRating?: number;
    status?: string;
    type?: string;
  }): Promise<Anime[]>;

  // Rating operations
  getRatings(): Promise<Rating[]>;
  getRatingsByAnimeId(animeId: number): Promise<Rating[]>;
  getUserRating(animeId: number, userId: string): Promise<Rating | undefined>;
  createRating(rating: InsertRating): Promise<Rating>;
  updateRating(animeId: number, userId: string, rating: number): Promise<Rating | undefined>;
  getUserStats(userId: string): Promise<{
    totalRated: number;
    averageRating: number;
    favorites: number;
  }>;
}

export class MemStorage implements IStorage {
  private anime: Map<number, Anime>;
  private ratings: Map<string, Rating>;
  private animeIdCounter: number;

  constructor() {
    this.anime = new Map();
    this.ratings = new Map();
    this.animeIdCounter = 1;
  }

  async getAnime(): Promise<Anime[]> {
    return Array.from(this.anime.values());
  }

  async getAnimeById(id: number): Promise<Anime | undefined> {
    return this.anime.get(id);
  }

  async getAnimeByMalId(malId: number): Promise<Anime | undefined> {
    return Array.from(this.anime.values()).find(anime => anime.malId === malId);
  }

  async createAnime(insertAnime: InsertAnime): Promise<Anime> {
    const id = this.animeIdCounter++;
    const anime: Anime = {
      ...insertAnime,
      id,
      type: insertAnime.type || null,
      status: insertAnime.status || null,
      englishTitle: insertAnime.englishTitle || null,
      genres: insertAnime.genres || [],
      synopsis: insertAnime.synopsis || null,
      imageUrl: insertAnime.imageUrl || null,
      episodes: insertAnime.episodes || null,
      aired: insertAnime.aired || null,
      score: insertAnime.score || null,
      scoredBy: insertAnime.scoredBy || null,
      year: insertAnime.year || null,
      createdAt: new Date(),
    };
    this.anime.set(id, anime);
    return anime;
  }

  async updateAnime(id: number, updateData: Partial<InsertAnime>): Promise<Anime | undefined> {
    const existing = this.anime.get(id);
    if (!existing) return undefined;

    const updated: Anime = {
      ...existing,
      ...updateData,
    };
    this.anime.set(id, updated);
    return updated;
  }

  async searchAnime(query: string): Promise<Anime[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.anime.values()).filter(anime =>
      anime.title.toLowerCase().includes(searchTerm) ||
      anime.englishTitle?.toLowerCase().includes(searchTerm) ||
      (anime.genres && anime.genres.some(genre => genre.toLowerCase().includes(searchTerm)))
    );
  }

  async filterAnime(filters: {
    genre?: string;
    minRating?: number;
    status?: string;
    type?: string;
  }): Promise<Anime[]> {
    return Array.from(this.anime.values()).filter(anime => {
      if (filters.genre && (!anime.genres || !anime.genres.includes(filters.genre))) return false;
      if (filters.minRating && (!anime.score || anime.score < filters.minRating)) return false;
      if (filters.status && anime.status !== filters.status) return false;
      if (filters.type && anime.type !== filters.type) return false;
      return true;
    });
  }

  async getRatings(): Promise<Rating[]> {
    return Array.from(this.ratings.values());
  }

  async getRatingsByAnimeId(animeId: number): Promise<Rating[]> {
    return Array.from(this.ratings.values()).filter(rating => rating.animeId === animeId);
  }

  async getUserRating(animeId: number, userId: string): Promise<Rating | undefined> {
    return Array.from(this.ratings.values()).find(
      rating => rating.animeId === animeId && rating.userId === userId
    );
  }

  async createRating(insertRating: InsertRating): Promise<Rating> {
    const id = randomUUID();
    const now = new Date();
    const rating: Rating = {
      ...insertRating,
      id,
      userId: insertRating.userId || "default-user",
      createdAt: now,
      updatedAt: now,
    };
    this.ratings.set(id, rating);
    return rating;
  }

  async updateRating(animeId: number, userId: string, ratingValue: number): Promise<Rating | undefined> {
    const existing = Array.from(this.ratings.values()).find(
      rating => rating.animeId === animeId && rating.userId === userId
    );
    
    if (!existing) return undefined;

    const updated: Rating = {
      ...existing,
      rating: ratingValue,
      updatedAt: new Date(),
    };
    this.ratings.set(existing.id, updated);
    return updated;
  }

  async getUserStats(userId: string): Promise<{
    totalRated: number;
    averageRating: number;
    favorites: number;
  }> {
    const userRatings = Array.from(this.ratings.values()).filter(
      rating => rating.userId === userId
    );

    const totalRated = userRatings.length;
    const averageRating = totalRated > 0 
      ? userRatings.reduce((sum, rating) => sum + rating.rating, 0) / totalRated
      : 0;
    const favorites = userRatings.filter(rating => rating.rating >= 9).length;

    return {
      totalRated,
      averageRating: Math.round(averageRating * 10) / 10,
      favorites,
    };
  }
}

export const storage = new MemStorage();
