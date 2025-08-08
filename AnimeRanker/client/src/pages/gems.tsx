import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Gem, Sparkles, Eye } from "lucide-react";
import { SearchHeader } from "@/components/search-header";
import { AnimeCard } from "@/components/anime-card";
import { RatingModal } from "@/components/rating-modal";
import { animeApi } from "@/lib/anime-api";
import { useLanguage } from "@/contexts/language-context";
import type { Anime } from "@/types/anime";

export default function Gems() {
  const { t } = useLanguage();
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  // Get user ratings
  const { data: ratingsData } = useQuery({
    queryKey: ["/api/ratings"],
    queryFn: animeApi.getUserRatings,
    staleTime: 30000,
  });

  // Get popular anime (we'll filter these for hidden gems)
  const { data: popularData, isLoading } = useQuery({
    queryKey: ["/api/anime/popular"],
    queryFn: () => animeApi.getPopularAnime(1),
  });

  const userRatings = ratingsData?.data || {};
  const animeList = popularData?.data || [];

  // Filter for "hidden gems" - high rated anime with relatively few votes
  const hiddenGems = [...animeList]
    .filter(anime => 
      anime.score && 
      anime.score >= 8.0 && 
      anime.scoredBy && 
      anime.scoredBy < 50000 // Less than 50k votes makes it "hidden"
    )
    .sort((a, b) => {
      // Sort by score first, then by fewer votes (more hidden)
      const scoreDiff = (b.score || 0) - (a.score || 0);
      if (Math.abs(scoreDiff) > 0.1) return scoreDiff;
      return (a.scoredBy || 0) - (b.scoredBy || 0);
    })
    .slice(0, 16);

  const handleRatingClick = (anime: Anime) => {
    setSelectedAnime(anime);
    setIsRatingModalOpen(true);
  };

  const handleCloseRatingModal = () => {
    setIsRatingModalOpen(false);
    setSelectedAnime(null);
  };

  const formatVotes = (votes: number) => {
    if (votes > 1000) {
      return `${(votes / 1000).toFixed(1)}k`;
    }
    return votes.toString();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SearchHeader onSearch={() => {}} isSearching={false} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Gem className="w-12 h-12 text-secondary mr-4" />
            <h1 className="text-4xl font-bold text-gray-800">{t("gems.title")}</h1>
          </div>
          <p className="text-xl text-gray-600 mb-2">{t("gems.subtitle")}</p>
          <p className="text-gray-500">{t("gems.description")}</p>
          
          {/* Criteria explanation */}
          <div className="bg-gradient-to-r from-secondary/10 to-primary/10 rounded-xl p-6 mt-6 border border-gray-200">
            <div className="flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6 text-secondary mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Criterios de Selección</h3>
            </div>
            <p className="text-gray-600">{t("gems.criteria")}</p>
            <div className="flex items-center justify-center space-x-8 mt-4 text-sm text-gray-500">
              <div className="flex items-center">
                <span className="font-semibold text-accent">8.0+</span>
                <span className="ml-1">Puntuación</span>
              </div>
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                <span className="font-semibold text-primary">&lt;50k</span>
                <span className="ml-1">Votos</span>
              </div>
            </div>
          </div>
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
        ) : hiddenGems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {hiddenGems.map((anime, index) => (
              <div key={anime.malId} className="relative">
                {/* Gem rank indicator */}
                <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-secondary to-primary text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  <Gem className="w-4 h-4 inline mr-1" />
                  #{index + 1}
                </div>
                
                {/* Votes indicator */}
                <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-gray-600 shadow">
                  <Eye className="w-3 h-3 inline mr-1" />
                  {formatVotes(anime.scoredBy || 0)}
                </div>
                
                <div className="bg-gradient-to-b from-white to-secondary/5 rounded-xl border-2 border-secondary/20 hover:border-secondary/40 transition-all duration-300">
                  <AnimeCard
                    anime={anime}
                    userRating={userRatings[anime.malId]}
                    onRatingClick={handleRatingClick}
                  />
                  
                  {/* Quality score */}
                  <div className="px-4 pb-4">
                    <div className="flex items-center justify-between bg-gradient-to-r from-secondary/10 to-primary/10 rounded-lg p-2">
                      <span className="text-sm font-medium text-gray-700">Calidad Oculta</span>
                      <div className="flex items-center">
                        <Sparkles className="w-4 h-4 text-secondary mr-1" />
                        <span className="font-bold text-secondary">{anime.score?.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Gem className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No se encontraron joyas ocultas en este momento</p>
            <p className="text-gray-400 text-sm mt-2">Las joyas aparecen cuando hay animes con alta calificación pero pocos votos</p>
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