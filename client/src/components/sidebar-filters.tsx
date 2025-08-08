import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { animeApi } from "@/lib/anime-api";
import { useLanguage } from "@/contexts/language-context";
import type { AnimeFilters } from "@/types/anime";

interface SidebarFiltersProps {
  filters: AnimeFilters;
  onFiltersChange: (filters: AnimeFilters) => void;
}

export function SidebarFilters({ filters, onFiltersChange }: SidebarFiltersProps) {
  const { t } = useLanguage();
  const { data: genresData } = useQuery({
    queryKey: ["/api/genres"],
    queryFn: animeApi.getGenres,
    staleTime: Infinity,
  });

  const genres = genresData?.data || [];

  const handleGenreChange = (genreName: string) => {
    onFiltersChange({
      ...filters,
      genre: genreName === "all" ? undefined : genreName,
    });
  };

  const handleMinRatingChange = (rating: string) => {
    onFiltersChange({
      ...filters,
      minRating: rating === "any" ? undefined : parseInt(rating),
    });
  };

  const handleStatusChange = (status: string[]) => {
    onFiltersChange({
      ...filters,
      status: status.length > 0 ? status[0] : undefined,
    });
  };

  const handleMyRatingsChange = (value: string) => {
    // This would be implemented with user rating filtering logic
    console.log("My ratings filter:", value);
  };

  const clearFilters = () => {
    onFiltersChange({
      sortBy: filters.sortBy, // Keep sort preference
    });
  };

  return (
    <aside className="w-80 bg-white rounded-xl p-6 h-fit sticky top-24 border border-gray-200">
      <h3 className="text-lg font-semibold mb-6 text-gray-800">{t("filters.title")}</h3>
      
      {/* Genre Filter */}
      <div className="mb-6">
        <Label className="block text-sm font-medium mb-3 text-gray-600">
          {t("filters.genre")}
        </Label>
        <Select value={filters.genre || "all"} onValueChange={handleGenreChange}>
          <SelectTrigger 
            className="w-full bg-gray-50 border-gray-200 text-gray-700 focus:border-accent"
            data-testid="genre-select"
          >
            <SelectValue placeholder={t("filters.genre.all")} />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            <SelectItem value="all" className="text-gray-700 hover:bg-gray-50">
              {t("filters.genre.all")}
            </SelectItem>
            {genres.slice(0, 20).map((genre) => (
              <SelectItem 
                key={genre.mal_id} 
                value={genre.name}
                className="text-gray-700 hover:bg-gray-50"
              >
                {genre.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Rating Filter */}
      <div className="mb-6">
        <Label className="block text-sm font-medium mb-3 text-gray-600">
          {t("filters.rating")}
        </Label>
        <Select 
          value={filters.minRating?.toString() || "any"} 
          onValueChange={handleMinRatingChange}
        >
          <SelectTrigger 
            className="w-full bg-gray-50 border-gray-200 text-gray-700 focus:border-accent"
            data-testid="rating-select"
          >
            <SelectValue placeholder={t("filters.rating.any")} />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            <SelectItem value="any" className="text-gray-700 hover:bg-gray-50">
              {t("filters.rating.any")}
            </SelectItem>
            <SelectItem value="9" className="text-gray-700 hover:bg-gray-50">
              9+ {t("filters.rating.stars")}
            </SelectItem>
            <SelectItem value="8" className="text-gray-700 hover:bg-gray-50">
              8+ {t("filters.rating.stars")}
            </SelectItem>
            <SelectItem value="7" className="text-gray-700 hover:bg-gray-50">
              7+ {t("filters.rating.stars")}
            </SelectItem>
            <SelectItem value="6" className="text-gray-700 hover:bg-gray-50">
              6+ {t("filters.rating.stars")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status Filter */}
      <div className="mb-6">
        <Label className="block text-sm font-medium mb-3 text-gray-600">
          {t("filters.status")}
        </Label>
        <div className="space-y-2">
          {['Finished Airing', 'Currently Airing', 'Not yet aired'].map((status) => (
            <div key={status} className="flex items-center space-x-2">
              <Checkbox 
                id={status}
                checked={filters.status === status}
                onCheckedChange={(checked) => {
                  if (checked) {
                    handleStatusChange([status]);
                  } else {
                    handleStatusChange([]);
                  }
                }}
                className="border-accent/30 data-[state=checked]:bg-highlight data-[state=checked]:border-highlight"
                data-testid={`status-${status.toLowerCase().replace(/\s+/g, '-')}`}
              />
              <Label 
                htmlFor={status}
                className="text-sm text-gray-700 cursor-pointer"
              >
                {status}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* My Ratings Filter */}
      <div className="mb-6">
        <Label className="block text-sm font-medium mb-3 text-gray-600">
          {t("filters.my.ratings")}
        </Label>
        <RadioGroup defaultValue="all" onValueChange={handleMyRatingsChange}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem 
              value="all" 
              id="all-anime"
              className="border-accent/30 text-highlight"
              data-testid="rating-filter-all"
            />
            <Label htmlFor="all-anime" className="text-sm text-gray-700 cursor-pointer">
              {t("filters.my.ratings.all")}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem 
              value="rated" 
              id="rated-anime"
              className="border-gray-300 text-accent"
              data-testid="rating-filter-rated"
            />
            <Label htmlFor="rated-anime" className="text-sm text-gray-700 cursor-pointer">
              {t("filters.my.ratings.rated")}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem 
              value="unrated" 
              id="unrated-anime"
              className="border-gray-300 text-accent"
              data-testid="rating-filter-unrated"
            />
            <Label htmlFor="unrated-anime" className="text-sm text-gray-700 cursor-pointer">
              {t("filters.my.ratings.unrated")}
            </Label>
          </div>
        </RadioGroup>
      </div>

      <Button 
        onClick={clearFilters}
        variant="outline"
        className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
        data-testid="clear-filters-button"
      >
        {t("filters.clear")}
      </Button>
    </aside>
  );
}
