import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Trophy, Medal, Award } from "lucide-react";
import { SearchHeader } from "@/components/search-header";
import { AnimeCard } from "@/components/anime-card";
import { RatingModal } from "@/components/rating-modal";
import { animeApi } from "@/lib/anime-api";
import { useLanguage } from "@/contexts/language-context";
import type { Anime } from "@/types/anime";

export default function Ranking() {
  const { t } = useLanguage();
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  // Get user ratings
  const { data: ratingsData } = useQuery({
    queryKey: ["/api/ratings"],
    queryFn: animeApi.getUserRatings,
    staleTime: 30000,
  });

  // Get popular anime (we'll filter these by highest ratings)
  const { data: popularData, isLoading } = useQuery({
    queryKey: ["/api/anime/popular"],
    queryFn: () => animeApi.getPopularAnime(1),
  });

  const userRatings = ratingsData?.data || {};
  const animeList = popularData?.data || [];

  // Sort anime by their average rating (descending)
  const topRatedAnime = [...animeList]
    .filter(anime => anime.score && anime.score > 0)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 20);

  const handleRatingClick = (anime: Anime) => {
    setSelectedAnime(anime);
    setIsRatingModalOpen(true);
  };

  const handleCloseRatingModal = () => {
    setIsRatingModalOpen(false);
    setSelectedAnime(null);
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-lg font-bold text-primary">#{index + 1}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SearchHeader onSearch={() => {}} isSearching={false} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="w-12 h-12 text-primary mr-4" />
            <h1 className="text-4xl font-bold text-gray-800">{t("ranking.title")}</h1>
          </div>
          <p className="text-xl text-gray-600 mb-2">{t("ranking.subtitle")}</p>
          <p className="text-gray-500">Top 20 de animes con mayor puntuación en MyAnimeList</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div 
                key={i}
                className="bg-white rounded-xl h-80 animate-pulse border border-gray-200"
              />
            ))}
          </div>
        ) : topRatedAnime.length > 0 ? (
          <div className="space-y-6">
            {/* Top 3 Special Display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {topRatedAnime.slice(0, 3).map((anime, index) => (
                <div 
                  key={anime.malId}
                  className="bg-gradient-to-b from-primary/10 to-white rounded-xl p-4 border-2 border-primary/20"
                >
                  <div className="flex items-center justify-between mb-4">
                    {getRankIcon(index)}
                    <span className="text-2xl font-bold text-primary">
                      {anime.score?.toFixed(1)}
                    </span>
                  </div>
                  <AnimeCard
                    anime={anime}
                    userRating={userRatings[anime.malId]}
                    onRatingClick={handleRatingClick}
                  />
                </div>
              ))}
            </div>

            {/* Rest of Top 20 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">{t("ranking.top")} 4-20</h2>
              <div className="space-y-4">
                {topRatedAnime.slice(3, 20).map((anime, index) => (
                  <div 
                    key={anime.malId}
                    className="flex items-center bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mr-4">
                      <span className="text-lg font-bold text-gray-700">#{index + 4}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{anime.title}</h3>
                          <p className="text-sm text-gray-600">
                            {anime.genres.slice(0, 2).join(", ")}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-accent">
                              {anime.score?.toFixed(1)}
                            </div>
                            <div className="text-xs text-gray-500">MyAnimeList</div>
                          </div>
                          {userRatings[anime.malId] && (
                            <div className="text-center">
                              <div className="text-lg font-bold text-primary">
                                {userRatings[anime.malId]}/10
                              </div>
                              <div className="text-xs text-gray-500">{t("card.your.rating")}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">{t("ranking.no.ratings")}</p>
          </div>
        )}
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