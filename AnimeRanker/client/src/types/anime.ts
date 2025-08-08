export interface Anime {
  id: number;
  malId: number;
  title: string;
  englishTitle?: string | null;
  genres: string[];
  synopsis?: string | null;
  imageUrl?: string | null;
  episodes?: number | null;
  status?: string | null;
  aired?: string | null;
  score?: number | null;
  scoredBy?: number | null;
  type?: string | null;
  year?: number | null;
}

export interface UserStats {
  totalRated: number;
  averageRating: number;
  favorites: number;
}

export interface Genre {
  mal_id: number;
  name: string;
  url: string;
  count: number;
}

export interface AnimeFilters {
  genre?: string;
  minRating?: number;
  status?: string;
  type?: string;
  search?: string;
  sortBy?: 'popularity' | 'rating' | 'title' | 'year';
}
