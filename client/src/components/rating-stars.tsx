import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  maxRating?: number;
  interactive?: boolean;
}

export function RatingStars({
  rating,
  onRatingChange,
  readonly = false,
  size = "md",
  showValue = false,
  maxRating = 10,
  interactive = false,
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-8 h-8",
  };

  const handleStarClick = (starRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const handleStarHover = (starRating: number) => {
    if (!readonly && interactive) {
      setHoverRating(starRating);
    }
  };

  const handleStarLeave = () => {
    if (!readonly && interactive) {
      setHoverRating(0);
    }
  };

  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  const renderStarRow = (startIndex: number, endIndex: number) => (
    <div className="flex items-center space-x-1">
      {Array.from({ length: endIndex - startIndex + 1 }, (_, i) => {
        const starRating = startIndex + i;
        const isFilled = starRating <= displayRating;
        const isHovered = interactive && hoverRating > 0 && starRating <= hoverRating;
        
        return (
          <button
            key={starRating}
            type="button"
            onClick={() => handleStarClick(starRating)}
            onMouseEnter={() => handleStarHover(starRating)}
            onMouseLeave={handleStarLeave}
            disabled={readonly}
            className={cn(
              "transition-all duration-200",
              !readonly && "hover:scale-110 cursor-pointer transform",
              readonly && "cursor-default",
              interactive && !readonly && "hover:drop-shadow-lg"
            )}
            data-testid={`star-${starRating}`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                "transition-all duration-200",
                isFilled
                  ? isHovered
                    ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                    : "fill-yellow-400 text-yellow-400"
                  : readonly
                  ? "text-gray-400"
                  : isHovered
                  ? "text-amber-300 scale-110"
                  : "text-gray-400 hover:text-yellow-300"
              )}
            />
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col items-center space-y-2">
      {maxRating === 10 ? (
        <>
          {renderStarRow(1, 5)}
          {renderStarRow(6, 10)}
        </>
      ) : (
        <div className="flex items-center space-x-1">
          {Array.from({ length: maxRating }, (_, i) => {
            const starRating = i + 1;
            const isFilled = starRating <= displayRating;
            const isHovered = interactive && hoverRating > 0 && starRating <= hoverRating;
            
            return (
              <button
                key={starRating}
                type="button"
                onClick={() => handleStarClick(starRating)}
                onMouseEnter={() => handleStarHover(starRating)}
                onMouseLeave={handleStarLeave}
                disabled={readonly}
                className={cn(
                  "transition-all duration-200",
                  !readonly && "hover:scale-110 cursor-pointer transform",
                  readonly && "cursor-default",
                  interactive && !readonly && "hover:drop-shadow-lg"
                )}
                data-testid={`star-${starRating}`}
              >
                <Star
                  className={cn(
                    sizeClasses[size],
                    "transition-all duration-200",
                    isFilled
                      ? isHovered
                        ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                        : "fill-yellow-400 text-yellow-400"
                      : readonly
                      ? "text-gray-400"
                      : isHovered
                      ? "text-amber-300 scale-110"
                      : "text-gray-400 hover:text-yellow-300"
                  )}
                />
              </button>
            );
          })}
        </div>
      )}
      
      {showValue && (
        <div className="text-2xl font-bold text-highlight">
          {rating}/{maxRating}
        </div>
      )}
    </div>
  );
}
