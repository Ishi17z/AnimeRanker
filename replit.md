# AnimeRate

## Overview

AnimeRate is a full-stack web application for rating and discovering anime. Users can search for anime titles, rate them on a 1-10 scale, and explore popular series. The application integrates with the Jikan API (MyAnimeList's API) to fetch comprehensive anime data and provides a modern, responsive interface for anime enthusiasts to track their viewing preferences.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with custom dark theme variables and Inter font integration

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Session Management**: Express sessions with PostgreSQL session store
- **API Integration**: Fetch-based integration with Jikan API (MyAnimeList)
- **Error Handling**: Centralized error middleware with structured JSON responses

### Database Schema
- **anime table**: Stores cached anime data from Jikan API including MAL ID, titles, genres, synopsis, images, episodes, status, scores, and metadata
- **ratings table**: User ratings linked to anime entries with UUID primary keys, user IDs, and timestamp tracking
- **Database Provider**: Neon Database (serverless PostgreSQL)

### Data Flow
- **Anime Discovery**: Fetches popular anime and search results from Jikan API, caches in local database
- **Rating System**: Stores user ratings locally with real-time updates and statistics calculation  
- **Caching Strategy**: TanStack Query provides client-side caching with configurable stale times
- **Memory Fallback**: In-memory storage implementation for development/testing environments

### Component Architecture
- **Modular Components**: Reusable UI components (AnimeCard, RatingStars, SearchHeader, SidebarFilters)
- **Modal System**: Dialog-based rating interface with form validation
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **State Synchronization**: Optimistic updates with server reconciliation

### Development Workflow
- **Build Process**: Vite for frontend bundling, esbuild for server compilation
- **Development Server**: Vite middleware integration with Express for seamless full-stack development
- **Type Safety**: Shared TypeScript types between frontend and backend via shared directory

## External Dependencies

### APIs and Services
- **Jikan API v4**: Official MyAnimeList API for anime data, ratings, and metadata
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling

### Key Libraries
- **UI Framework**: React 18 with TypeScript and Wouter routing
- **Database**: Drizzle ORM with Neon serverless PostgreSQL adapter
- **HTTP Client**: Axios for API requests with interceptors
- **Form Management**: React Hook Form with Zod validation
- **Component Library**: Radix UI primitives with Shadcn/ui styling system
- **Styling**: Tailwind CSS with class-variance-authority for component variants
- **Build Tools**: Vite with React plugin and Replit-specific development enhancements

### Development Tools
- **Runtime Error Handling**: Replit runtime error modal integration
- **Code Mapping**: Source map support for debugging
- **Session Storage**: Connect-pg-simple for PostgreSQL session persistence