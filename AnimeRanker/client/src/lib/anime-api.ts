import { apiRequest } from "./queryClient";
import type { Anime, UserStats, Genre } from "../types/anime";

export const animeApi = {
  getPopularAnime: async (page = 1): Promise<{ data: Anime[] }> => {
    const response = await apiRequest("GET", `/api/anime/popular?page=${page}&limit=24`);
    return response.json();
  },

  searchAnime: async (query: string, page = 1): Promise<{ data: Anime[] }> => {
    const response = await apiRequest("GET", `/api/anime/search?q=${encodeURIComponent(query)}&page=${page}`);
    return response.json();
  },

  getUserRatings: async (): Promise<{ data: Record<number, number> }> => {
    const response = await apiRequest("GET", "/api/ratings");
    return response.json();
  },

  rateAnime: async (animeId: number, rating: number): Promise<{ data: any }> => {
    const response = await apiRequest("POST", "/api/ratings", { animeId, rating });
    return response.json();
  },

  getUserStats: async (): Promise<{ data: UserStats }> => {
    const response = await apiRequest("GET", "/api/stats");
    return response.json();
  },

  getGenres: async (): Promise<{ data: Genre[] }> => {
    const response = await apiRequest("GET", "/api/genres");
    return response.json();
  },
};
