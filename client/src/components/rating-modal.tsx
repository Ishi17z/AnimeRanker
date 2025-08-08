import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RatingStars } from "./rating-stars";
import { animeApi } from "@/lib/anime-api";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";
import type { Anime } from "@/types/anime";

interface RatingModalProps {
  anime: Anime | null;
  currentRating?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function RatingModal({ anime, currentRating = 0, isOpen, onClose }: RatingModalProps) {
  const [rating, setRating] = useState(currentRating);
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  useEffect(() => {
    setRating(currentRating);
  }, [currentRating, isOpen]);

  const rateMutation = useMutation({
    mutationFn: ({ animeId, rating }: { animeId: number; rating: number }) =>
      animeApi.rateAnime(animeId, rating),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ratings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: t("toast.rating.saved"),
        description: `${t("toast.rating.saved.desc")} "${anime?.title}" ${rating}/10`,
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: t("toast.error"),
        description: t("toast.error.rating"),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!anime || rating === 0) return;
    
    rateMutation.mutate({
      animeId: anime.malId,
      rating,
    });
  };

  const handleClose = () => {
    setRating(currentRating);
    onClose();
  };

  if (!anime) return null;

  const defaultImage = "https://via.placeholder.com/200x300/1a1a2e/ffffff?text=No+Image";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="bg-secondary rounded-2xl p-8 max-w-md w-full mx-4 border border-accent/20"
        data-testid="rating-modal"
      >
        <DialogHeader>
          <DialogTitle className="sr-only">Rate Anime</DialogTitle>
        </DialogHeader>
        
        <div className="text-center">
          <img 
            src={anime.imageUrl || defaultImage}
            alt={`${anime.title} poster`}
            className="w-32 h-48 object-cover rounded-lg mx-auto mb-4"
            onError={(e) => {
              (e.target as HTMLImageElement).src = defaultImage;
            }}
            data-testid="modal-anime-image"
          />
          
          <h3 
            className="text-xl font-bold mb-2 text-gray-800"
            data-testid="modal-anime-title"
          >
            {t("modal.rate.title")}
          </h3>
          
          <p 
            className="text-gray-400 mb-6"
            data-testid="modal-anime-name"
          >
            {anime.title}
          </p>
          
          {/* Rating Interface */}
          <div className="mb-6">
            <RatingStars
              rating={rating}
              onRatingChange={setRating}
              size="lg"
              showValue={true}
              maxRating={10}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
              disabled={rateMutation.isPending}
              data-testid="cancel-rating-button"
            >
              {t("modal.cancel")}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || rateMutation.isPending}
              className="flex-1 bg-primary hover:bg-primary/80 text-white"
              data-testid="save-rating-button"
            >
              {rateMutation.isPending ? t("modal.saving") : t("modal.save")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
