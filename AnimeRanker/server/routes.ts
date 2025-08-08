import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRatingSchema } from "@shared/schema";
import { z } from "zod";

const JIKAN_API_BASE = "https://api.jikan.moe/v4";

interface JikanAnime {
  mal_id: number;
  title: string;
  title_english?: string;
  genres: Array<{ name: string }>;
  synopsis?: string;
  images: {
    jpg: {
      image_url: string;
    };
  };
  episodes?: number;
  status: string;
  aired: {
    string: string;
  };
  score?: number;
  scored_by?: number;
  type: string;
  year?: number;
}

async function fetchFromJikan(endpoint: string): Promise<any> {
  try {
    const response = await fetch(`${JIKAN_API_BASE}${endpoint}`);
    if (!response.ok) {
      throw new Error(`Jikan API error: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching from Jikan API:", error);
    throw error;
  }
}

function transformJikanAnime(jikanAnime: JikanAnime) {
  return {
    malId: jikanAnime.mal_id,
    title: jikanAnime.title,
    englishTitle: jikanAnime.title_english || null,
    genres: jikanAnime.genres?.map(g => g.name) || [],
    synopsis: jikanAnime.synopsis || null,
    imageUrl: jikanAnime.images?.jpg?.image_url || null,
    episodes: jikanAnime.episodes || null,
    status: jikanAnime.status || null,
    aired: jikanAnime.aired?.string || null,
    score: jikanAnime.score || null,
    scoredBy: jikanAnime.scored_by || null,
    type: jikanAnime.type || null,
    year: jikanAnime.year || null,
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get popular anime from Jikan API
  app.get("/api/anime/popular", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 24;
      
      const data = await fetchFromJikan(`/top/anime?type=tv&page=${page}&limit=${limit}`);
      
      const animeList = data.data.map((anime: JikanAnime) => {
        return {
          id: anime.mal_id,
          ...transformJikanAnime(anime)
        };
      });

      // Store in memory for rating functionality
      for (const anime of animeList) {
        const existing = await storage.getAnimeByMalId(anime.malId);
        if (!existing) {
          await storage.createAnime(anime);
        }
      }

      res.json({ data: animeList });
    } catch (error) {
      console.error("Error fetching popular anime:", error);
      res.status(500).json({ message: "Failed to fetch popular anime" });
    }
  });

  // Search anime
  app.get("/api/anime/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      
      if (!query || query.trim().length === 0) {
        return res.status(400).json({ message: "Search query is required" });
      }

      const data = await fetchFromJikan(`/anime?q=${encodeURIComponent(query)}&page=${page}&limit=24`);
      
      const animeList = data.data.map((anime: JikanAnime) => {
        return {
          id: anime.mal_id,
          ...transformJikanAnime(anime)
        };
      });

      // Store in memory
      for (const anime of animeList) {
        const existing = await storage.getAnimeByMalId(anime.malId);
        if (!existing) {
          await storage.createAnime(anime);
        }
      }

      res.json({ data: animeList });
    } catch (error) {
      console.error("Error searching anime:", error);
      res.status(500).json({ message: "Failed to search anime" });
    }
  });

  // Get anime by genres
  app.get("/api/anime/genres/:genreId", async (req, res) => {
    try {
      const genreId = req.params.genreId;
      const page = parseInt(req.query.page as string) || 1;
      
      const data = await fetchFromJikan(`/anime?genres=${genreId}&page=${page}&limit=24`);
      
      const animeList = data.data.map((anime: JikanAnime) => {
        return {
          id: anime.mal_id,
          ...transformJikanAnime(anime)
        };
      });

      res.json({ data: animeList });
    } catch (error) {
      console.error("Error fetching anime by genre:", error);
      res.status(500).json({ message: "Failed to fetch anime by genre" });
    }
  });

  // Get user ratings for anime list
  app.get("/api/ratings", async (req, res) => {
    try {
      const userId = req.query.userId as string || "default-user";
      const ratings = await storage.getRatings();
      const userRatings = ratings.filter(r => r.userId === userId);
      
      // Create a map for easy lookup
      const ratingsMap: Record<number, number> = {};
      userRatings.forEach(rating => {
        ratingsMap[rating.animeId] = rating.rating;
      });
      
      res.json({ data: ratingsMap });
    } catch (error) {
      console.error("Error fetching ratings:", error);
      res.status(500).json({ message: "Failed to fetch ratings" });
    }
  });

  // Create or update rating
  app.post("/api/ratings", async (req, res) => {
    try {
      const userId = "default-user"; // In a real app, this would come from authentication
      const { animeId, rating } = req.body;

      if (!animeId || rating === undefined) {
        return res.status(400).json({ message: "animeId and rating are required" });
      }

      if (rating < 1 || rating > 10) {
        return res.status(400).json({ message: "Rating must be between 1 and 10" });
      }

      // Check if rating already exists
      const existingRating = await storage.getUserRating(animeId, userId);
      
      if (existingRating) {
        // Update existing rating
        const updatedRating = await storage.updateRating(animeId, userId, rating);
        res.json({ data: updatedRating });
      } else {
        // Create new rating
        const newRating = await storage.createRating({
          animeId,
          userId,
          rating,
        });
        res.json({ data: newRating });
      }
    } catch (error) {
      console.error("Error saving rating:", error);
      res.status(500).json({ message: "Failed to save rating" });
    }
  });

  // Get user stats
  app.get("/api/stats", async (req, res) => {
    try {
      const userId = req.query.userId as string || "default-user";
      const stats = await storage.getUserStats(userId);
      res.json({ data: stats });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Get available genres from Jikan
  app.get("/api/genres", async (req, res) => {
    try {
      const data = await fetchFromJikan("/genres/anime");
      res.json({ data: data.data });
    } catch (error) {
      console.error("Error fetching genres:", error);
      res.status(500).json({ message: "Failed to fetch genres" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
