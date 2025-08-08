import { useState } from "react";
import { Search, Star, User, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage, type Language } from "@/contexts/language-context";

interface SearchHeaderProps {
  onSearch: (query: string) => void;
  isSearching?: boolean;
}

export function SearchHeader({ onSearch, isSearching = false }: SearchHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { language, setLanguage, t } = useLanguage();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const toggleLanguage = () => {
    setLanguage(language === "es" ? "en" : "es");
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-primary flex items-center">
              <Star className="mr-2 w-6 h-6" />
              {t("header.title")}
            </h1>
          </div>
          
          <div className="flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder={t("header.search.placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border-gray-200 pl-12 pr-20 text-gray-700 placeholder-gray-500 focus:border-accent focus:bg-white"
                data-testid="search-input"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Button
                type="submit"
                size="sm"
                disabled={isSearching}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-accent hover:bg-accent/80 text-white px-3 py-1 text-sm"
                data-testid="search-button"
              >
                {isSearching ? "..." : t("header.search.button")}
              </Button>
            </form>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              onClick={toggleLanguage}
              variant="outline"
              size="sm"
              className="border-gray-200 text-gray-700 hover:bg-gray-50"
              data-testid="language-toggle"
            >
              <Globe className="mr-2 w-4 h-4" />
              {language.toUpperCase()}
            </Button>
            <Button className="bg-primary hover:bg-primary/80 text-white">
              <User className="mr-2 w-4 h-4" />
              {t("header.profile")}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
