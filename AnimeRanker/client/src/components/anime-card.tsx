import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { RatingStars } from "./rating-stars";
import { animeApi } from "@/lib/anime-api";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";
import type { Anime } from "@/types/anime";

interface AnimeCardProps {
  anime: Anime;
  userRating?: number;
  onRatingClick: (anime: Anime) => void;
}

export function AnimeCard({ anime, userRating, onRatingClick }: AnimeCardProps) {
  const [imageError, setImageError] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  // Quick rating mutation for direct star clicks
  const quickRateMutation = useMutation({
    mutationFn: ({ animeId, rating }: { animeId: number; rating: number }) =>
      animeApi.rateAnime(animeId, rating),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/ratings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: t("toast.rating.saved"),
        description: `${t("toast.rating.saved.desc")} "${anime.title}" ${variables.rating}/10`,
      });
    },
    onError: () => {
      toast({
        title: t("toast.error"),
        description: t("toast.error.rating"),
        variant: "destructive",
      });
    },
  });

  const handleQuickRating = (rating: number) => {
    quickRateMutation.mutate({
      animeId: anime.malId,
      rating,
    });
  };

  const getStatusColor = (status?: string | null) => {
    if (!status) return "bg-gray-500";
    
    switch (status.toLowerCase()) {
      case "finished airing":
      case "completed":
        return "bg-success";
      case "currently airing":
      case "ongoing":
        return "bg-highlight";
      case "not yet aired":
      case "upcoming":
        return "bg-warning";
      default:
        return "bg-gray-500";
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const defaultImage = "https://via.placeholder.com/400x600/1a1a2e/ffffff?text=No+Image";

  return (
    <Card 
      className="bg-white rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200 cursor-pointer"
      data-testid={`anime-card-${anime.malId}`}
    >
      <div onClick={() => onRatingClick(anime)}>
        <img 
          src={imageError ? defaultImage : (anime.imageUrl || defaultImage)}
          alt={`${anime.title} poster`}
          className="w-full h-64 object-cover"
          onError={handleImageError}
          loading="lazy"
          data-testid={`anime-image-${anime.malId}`}
        />
      </div>
      
      <CardContent className="p-4">
        <h4 
          className="font-semibold text-lg mb-2 text-gray-800 line-clamp-2 min-h-[3.5rem]"
          title={anime.title}
          data-testid={`anime-title-${anime.malId}`}
        >
          {anime.title}
        </h4>
        
        <p 
          className="text-sm text-gray-600 mb-3 line-clamp-1"
          data-testid={`anime-genres-${anime.malId}`}
        >
          {anime.genres.length > 0 ? anime.genres.slice(0, 2).join(", ") : t("card.unknown.genre")}
        </p>
        
        {/* Rating Display */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-500">{t("card.avg.rating")}</span>
            <div className="flex items-center">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span 
                className="ml-1 text-sm font-medium text-gray-700"
                data-testid={`anime-avg-rating-${anime.malId}`}
              >
                {anime.score ? anime.score.toFixed(1) : "N/A"}
              </span>
            </div>
          </div>
          {anime.status && (
            <Badge 
              className={`text-xs text-white px-2 py-1 rounded ${getStatusColor(anime.status)}`}
              data-testid={`anime-status-${anime.malId}`}
            >
              {anime.status}
            </Badge>
          )}
        </div>

        {/* Personal Rating */}
        <div className="border-t border-gray-200 pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">{t("card.your.rating")}</span>
            <div className="flex items-center space-x-2">
              {userRating ? (
                <span 
                  className="text-lg font-bold text-primary"
                  data-testid={`user-rating-value-${anime.malId}`}
                >
                  {userRating}/10
                </span>
              ) : (
                <span 
                  className="text-sm text-gray-500"
                  data-testid={`user-rating-unrated-${anime.malId}`}
                >
                  {t("card.not.rated")}
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRatingClick(anime);
                }}
                className="text-xs text-accent hover:text-accent/80 underline"
              >
                {t("card.edit")}
              </button>
            </div>
          </div>
          
          <div 
            onClick={(e) => e.stopPropagation()}
            data-testid={`rating-stars-${anime.malId}`}
          >
            <RatingStars
              rating={userRating || 0}
              onRatingChange={handleQuickRating}
              readonly={quickRateMutation.isPending}
              size="sm"
              maxRating={10}
              interactive={true}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
