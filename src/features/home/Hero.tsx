import { Button } from "@/shared/components/ui/button";
import { Rocket, BookmarkPlus } from "lucide-react";
import ContentRail from "@/shared/components/ContentRail";
import { useNavigate } from "react-router-dom";
import { useTrendingMovies, useTrendingTV } from "@/shared/api/tmdb/hooks";
import { toPoster } from "@/shared/api/tmdb/client";
import { useMemo } from "react";

const Hero = () => {
  const navigate = useNavigate();

  // Fetch trending data
  const { data: trendingMovies } = useTrendingMovies();
  const { data: trendingTV } = useTrendingTV();

  // Extract poster URLs from trending movies
  const moviePosters = useMemo(() => {
    if (!trendingMovies) return [];
    return trendingMovies
      .filter(m => m.imageUrl)
      .map(m => m.imageUrl)
      .slice(0, 15);
  }, [trendingMovies]);

  // Extract poster URLs from trending TV shows
  const tvPosters = useMemo(() => {
    if (!trendingTV) return [];
    return trendingTV
      .filter(tv => tv.imageUrl)
      .map(tv => tv.imageUrl)
      .slice(0, 15);
  }, [trendingTV]);

  // Create a mixed rail with both movies and TV
  const mixedPosters = useMemo(() => {
    if (!trendingMovies || !trendingTV) return [];
    const combined = [
      ...trendingMovies.slice(0, 8).map(m => m.imageUrl),
      ...trendingTV.slice(0, 7).map(tv => tv.imageUrl)
    ].filter(Boolean);
    // Shuffle for variety
    return combined.sort(() => Math.random() - 0.5);
  }, [trendingMovies, trendingTV]);

  // Fallback posters if API hasn't loaded yet
  const fallbackPosters = [
    "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop",
    "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop",
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop",
    "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=400&h=600&fit=crop",
    "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&h=600&fit=crop",
    "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop",
    "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop",
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop",
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background">
      {/* Animated Content Rails Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Top Rail - Trending Movies Scrolling Left */}
        <div className="absolute top-0 left-0 right-0 h-[35%]">
          <ContentRail 
            images={moviePosters.length > 0 ? moviePosters : fallbackPosters} 
            direction="left" 
            speed={40} 
          />
        </div>
        
        {/* Middle Rail - Trending TV Shows Scrolling Right */}
        <div className="absolute top-[33%] left-0 right-0 h-[35%]">
          <ContentRail 
            images={tvPosters.length > 0 ? tvPosters : fallbackPosters} 
            direction="right" 
            speed={50} 
          />
        </div>
        
        {/* Bottom Rail - Mixed Content Scrolling Left */}
        <div className="absolute top-[66%] left-0 right-0 h-[35%]">
          <ContentRail 
            images={mixedPosters.length > 0 ? mixedPosters : fallbackPosters} 
            direction="left" 
            speed={45} 
          />
        </div>

        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60 z-10" />
      </div>
      
      {/* Hero Content */}
      <div className="container mx-auto px-4 relative z-20 text-center animate-fade-in">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Your Universe of{" "}
          <span className="text-primary bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Cinema
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Track, discover, and experience. Cinephile is your personal guide to the world
          of movies and TV shows.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            onClick={() => navigate("/movies")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 gap-2 shadow-lg hover:shadow-primary/50 transition-all"
          >
            <Rocket className="w-5 h-5" />
            Get Started
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => navigate("/watchlist")}
            className="rounded-full px-8 gap-2 border-primary/30 hover:border-primary hover:bg-primary/10"
          >
            <BookmarkPlus className="w-5 h-5" />
            My Watchlist
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
