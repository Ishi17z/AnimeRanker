import { createContext, useContext, useState, ReactNode } from "react";

export type Language = "es" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  es: {
    // Header
    "header.title": "AnimeRate",
    "header.search.placeholder": "Buscar animes...",
    "header.search.button": "Buscar",
    "header.profile": "Perfil",
    
    // Navigation
    "nav.home": "Inicio",
    "nav.ranking": "Ranking",
    "nav.gems": "Joyas",
    
    // Home page
    "home.stats.title": "Tu Aventura Anime",
    "home.stats.subtitle": "Descubre y puntúa tus series anime favoritas",
    "home.stats.rated": "Puntuados",
    "home.stats.average": "Promedio",
    "home.stats.favorites": "Favoritos",
    "home.popular": "Animes Populares",
    "home.search.results": "Resultados para",
    "home.sort.label": "Ordenar por:",
    "home.sort.popularity": "Popularidad",
    "home.sort.rating": "Puntuación",
    "home.sort.title": "Título",
    "home.sort.year": "Año",
    "home.load.more": "Cargar Más Animes",
    "home.no.results.search": "No se encontraron animes para tu búsqueda.",
    "home.no.results.filter": "No hay animes que coincidan con tus filtros actuales.",
    "home.clear.search": "Limpiar Búsqueda",
    "home.clear.filters": "Limpiar Filtros",
    
    // Ranking page
    "ranking.title": "Ranking de Animes",
    "ranking.subtitle": "Los animes mejor puntuados por la comunidad",
    "ranking.top": "Top",
    "ranking.no.ratings": "Aún no hay animes puntuados por los usuarios",
    
    // Gems page
    "gems.title": "Joyas Ocultas",
    "gems.subtitle": "Animes poco conocidos pero de excelente calidad",
    "gems.description": "Descubre animes extraordinarios que pocos han visto",
    "gems.criteria": "Animes con alta calificación pero pocos votos",
    
    // Anime card
    "card.avg.rating": "Prom:",
    "card.your.rating": "Tu Puntuación:",
    "card.not.rated": "Sin puntuar",
    "card.edit": "Editar",
    "card.unknown.genre": "Género Desconocido",
    
    // Rating modal
    "modal.rate.title": "Puntuar Anime",
    "modal.cancel": "Cancelar",
    "modal.save": "Guardar Puntuación",
    "modal.saving": "Guardando...",
    
    // Sidebar filters
    "filters.title": "Filtros",
    "filters.genre": "Género",
    "filters.genre.all": "Todos los Géneros",
    "filters.rating": "Puntuación Mínima",
    "filters.rating.any": "Cualquier Puntuación",
    "filters.rating.stars": "Estrellas",
    "filters.status": "Estado",
    "filters.status.finished": "Finished Airing",
    "filters.status.airing": "Currently Airing", 
    "filters.status.upcoming": "Not yet aired",
    "filters.my.ratings": "Mis Puntuaciones",
    "filters.my.ratings.all": "Todos los Animes",
    "filters.my.ratings.rated": "Puntuados por Mí",
    "filters.my.ratings.unrated": "Sin Puntuar",
    "filters.clear": "Limpiar Filtros",
    
    // Toasts
    "toast.rating.saved": "¡Puntuación guardada!",
    "toast.rating.saved.desc": "Puntuaste",
    "toast.error": "Error",
    "toast.error.rating": "No se pudo guardar la puntuación. Inténtalo de nuevo.",
    
    // Common
    "common.retry": "Reintentar",
    "common.failed.load": "Error al cargar. Inténtalo de nuevo.",
  },
  en: {
    // Header
    "header.title": "AnimeRate",
    "header.search.placeholder": "Search anime titles...",
    "header.search.button": "Search",
    "header.profile": "Profile",
    
    // Navigation
    "nav.home": "Home",
    "nav.ranking": "Ranking",
    "nav.gems": "Gems",
    
    // Home page
    "home.stats.title": "Your Anime Journey",
    "home.stats.subtitle": "Discover and rate your favorite anime series",
    "home.stats.rated": "Rated",
    "home.stats.average": "Average",
    "home.stats.favorites": "Favorites",
    "home.popular": "Popular Anime",
    "home.search.results": "Search Results for",
    "home.sort.label": "Sort by:",
    "home.sort.popularity": "Popularity",
    "home.sort.rating": "Rating",
    "home.sort.title": "Title",
    "home.sort.year": "Year",
    "home.load.more": "Load More Anime",
    "home.no.results.search": "No anime found for your search.",
    "home.no.results.filter": "No anime match your current filters.",
    "home.clear.search": "Clear Search",
    "home.clear.filters": "Clear Filters",
    
    // Ranking page
    "ranking.title": "Anime Ranking",
    "ranking.subtitle": "Top rated anime by the community",
    "ranking.top": "Top",
    "ranking.no.ratings": "No user-rated anime yet",
    
    // Gems page
    "gems.title": "Hidden Gems",
    "gems.subtitle": "Lesser-known anime with excellent quality",
    "gems.description": "Discover extraordinary anime that few have seen",
    "gems.criteria": "High-rated anime with few votes",
    
    // Anime card
    "card.avg.rating": "Avg:",
    "card.your.rating": "Your Rating:",
    "card.not.rated": "Not Rated",
    "card.edit": "Edit",
    "card.unknown.genre": "Unknown Genre",
    
    // Rating modal
    "modal.rate.title": "Rate Anime",
    "modal.cancel": "Cancel",
    "modal.save": "Save Rating",
    "modal.saving": "Saving...",
    
    // Sidebar filters
    "filters.title": "Filters",
    "filters.genre": "Genre",
    "filters.genre.all": "All Genres",
    "filters.rating": "Minimum Rating",
    "filters.rating.any": "Any Rating",
    "filters.rating.stars": "Stars",
    "filters.status": "Status",
    "filters.status.finished": "Finished Airing",
    "filters.status.airing": "Currently Airing",
    "filters.status.upcoming": "Not yet aired",
    "filters.my.ratings": "My Ratings",
    "filters.my.ratings.all": "All Anime",
    "filters.my.ratings.rated": "Rated by Me", 
    "filters.my.ratings.unrated": "Not Rated",
    "filters.clear": "Clear Filters",
    
    // Toasts
    "toast.rating.saved": "Rating saved!",
    "toast.rating.saved.desc": "You rated",
    "toast.error": "Error",
    "toast.error.rating": "Failed to save rating. Please try again.",
    
    // Common
    "common.retry": "Retry",
    "common.failed.load": "Failed to load. Please try again.",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>("es");

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}