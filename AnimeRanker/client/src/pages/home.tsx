import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { SearchHeader } from "@/components/search-header";
import { SidebarFilters } from "@/components/sidebar-filters";
import { AnimeCard } from "@/components/anime-card";
import { RatingModal } from "@/components/rating-modal";
import { animeApi } from "@/lib/anime-api";
import { useLanguage } from "@/contexts/language-context";
import type { Anime, AnimeFilters } from "@/types/anime";

export default function Home() {
  const { t } = useLanguage();
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [filters, setFilters] = useState<AnimeFilters>({
    sortBy: 'popularity',
  });

  // Fetch popular anime
  const { data: popularData, isLoading: isLoadingPopular, error: popularError } = useQuery({
    queryKey: ["/api/anime/popular", currentPage],
    queryFn: () => animeApi.getPopularAnime(currentPage),
    enabled: !isSearchMode,
  });

  // Search anime
  const { data: searchData, isLoading: isLoadingSearch, error: searchError } = useQuery({
    queryKey: ["/api/anime/search", searchQuery, currentPage],
    queryFn: () => animeApi.searchAnime(searchQuery, currentPage),
    enabled: isSearchMode && searchQuery.length > 0,
  });

  // Get user ratings
  const { data: ratingsData } = useQuery({
    queryKey: ["/api/ratings"],
    queryFn: animeApi.getUserRatings,
    staleTime: 30000,
  });

  // Get user stats
  const { data: statsData } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: animeApi.getUserStats,
    staleTime: 30000,
  });

  const userRatings = ratingsData?.data || {};
  const stats = statsData?.data || { totalRated: 0, averageRating: 0, favorites: 0 };

  // Update anime list when data changes
  useEffect(() => {
    const currentData = isSearchMode ? searchData : popularData;
    if (currentData?.data) {
      if (currentPage === 1) {
        setAnimeList(currentData.data);
      } else {
        setAnimeList(prev => [...prev, ...currentData.data]);
      }
    }
  }, [popularData, searchData, currentPage, isSearchMode]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearchMode(query.length > 0);
    setCurrentPage(1);
    setAnimeList([]);
  };

  // Handle sort change
  const handleSortChange = (sortBy: string) => {
    setFilters(prev => ({ ...prev, sortBy: sortBy as AnimeFilters['sortBy'] }));
    // Sort current anime list
    const sorted = [...animeList].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.score || 0) - (a.score || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'year':
          return (b.year || 0) - (a.year || 0);
        default:
          return (b.scoredBy || 0) - (a.scoredBy || 0);
      }
    });
    setAnimeList(sorted);
  };

  // Handle load more
  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  // Handle rating click
  const handleRatingClick = (anime: Anime) => {
    setSelectedAnime(anime);
    setIsRatingModalOpen(true);
  };

  // Close rating modal
  const handleCloseRatingModal = () => {
    setIsRatingModalOpen(false);
    setSelectedAnime(null);
  };

  const isLoading = isLoadingPopular || isLoadingSearch;
  const error = popularError || searchError;

  // Filter anime list based on current filters
  const filteredAnime = animeList.filter(anime => {
    if (filters.genre && !anime.genres.includes(filters.genre)) return false;
    if (filters.minRating && (!anime.score || anime.score < filters.minRating)) return false;
    if (filters.status && anime.status !== filters.status) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SearchHeader onSearch={handleSearch} isSearching={isLoading} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <SidebarFilters filters={filters} onFiltersChange={setFilters} />
          
          <main className="flex-1">
            {/* Stats Header */}
            <div className="bg-gradient-to-r from-secondary/20 to-accent/20 rounded-xl p-6 mb-8 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-gray-800">{t("home.stats.title")}</h2>
                  <p className="text-gray-600">{t("home.stats.subtitle")}</p>
                </div>
                <div className="flex space-x-6">
                  <div className="text-center">
                    <div 
                      className="text-2xl font-bold text-success"
                      data-testid="total-rated-stat"
                    >
                      {stats.totalRated}
                    </div>
                    <div className="text-sm text-gray-500">{t("home.stats.rated")}</div>
                  </div>
                  <div className="text-center">
                    <div 
                      className="text-2xl font-bold text-accent"
                      data-testid="average-rating-stat"
                    >
                      {stats.averageRating}
                    </div>
                    <div className="text-sm text-gray-500">{t("home.stats.average")}</div>
                  </div>
                  <div className="text-center">
                    <div 
                      className="text-2xl font-bold text-primary"
                      data-testid="favorites-stat"
                    >
                      {stats.favorites}
                    </div>
                    <div className="text-sm text-gray-500">{t("home.stats.favorites")}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                {isSearchMode ? `${t("home.search.results")} "${searchQuery}"` : t("home.popular")}
              </h3>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">{t("home.sort.label")}</span>
                <Select value={filters.sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger 
                    className="bg-white border-gray-200 text-gray-700 text-sm focus:border-accent w-32"
                    data-testid="sort-select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="popularity" className="text-gray-700 hover:bg-gray-50">
                      {t("home.sort.popularity")}
                    </SelectItem>
                    <SelectItem value="rating" className="text-gray-700 hover:bg-gray-50">
                      {t("home.sort.rating")}
                    </SelectItem>
                    <SelectItem value="title" className="text-gray-700 hover:bg-gray-50">
                      {t("home.sort.title")}
                    </SelectItem>
                    <SelectItem value="year" className="text-gray-700 hover:bg-gray-50">
                      {t("home.sort.year")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <div className="text-red-400 mb-4">
                  {t("common.failed.load")}
                </div>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                  className="border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  {t("common.retry")}
                </Button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && animeList.length === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div 
                    key={i}
                    className="bg-secondary rounded-xl h-80 animate-pulse border border-accent/20"
                  />
                ))}
              </div>
            )}

            {/* Anime Grid */}
            {filteredAnime.length > 0 && (
              <>
                <div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  data-testid="anime-grid"
                >
                  {filteredAnime.map((anime) => (
                    <AnimeCard
                      key={anime.malId}
                      anime={anime}
                      userRating={userRatings[anime.malId]}
                      onRatingClick={handleRatingClick}
                    />
                  ))}
                </div>

                {/* Load More */}
                {!isLoading && (
                  <div className="text-center mt-12">
                    <Button 
                      onClick={handleLoadMore}
                      className="bg-highlight hover:bg-highlight/80 text-white px-8 py-3 font-medium"
                      disabled={isLoading}
                      data-testid="load-more-button"
                    >
                      <Plus className="mr-2 w-4 h-4" />
                      {isLoading ? "Loading..." : t("home.load.more")}
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {!isLoading && filteredAnime.length === 0 && !error && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  {isSearchMode 
                    ? t("home.no.results.search")
                    : t("home.no.results.filter")
                  }
                </div>
                <Button 
                  onClick={() => {
                    setFilters({ sortBy: 'popularity' });
                    setSearchQuery("");
                    setIsSearchMode(false);
                    setCurrentPage(1);
                    setAnimeList([]);
                  }}
                  variant="outline"
                  className="border-accent/30 text-white hover:bg-accent/20"
                  data-testid="clear-search-button"
                >
                  {isSearchMode ? t("home.clear.search") : t("home.clear.filters")}
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Rating Modal */}
      <RatingModal
        anime={selectedAnime}
        currentRating={selectedAnime ? userRatings[selectedAnime.malId] : 0}
        isOpen={isRatingModalOpen}
        onClose={handleCloseRatingModal}
      />
    </div>
  );
}
