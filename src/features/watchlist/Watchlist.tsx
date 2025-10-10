import Navbar from "@/shared/components/layout/Navbar";
import Footer from "@/shared/components/layout/Footer";
import MovieCard from "@/shared/components/MovieCard";
import { BookmarkPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { getWatchlist, WatchlistItem, removeFromWatchlist } from "@/shared/api/supabase/watchlist";
import { useAuth } from "@/context/AuthProvider";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { SEO } from "@/shared/components/SEO";

const Watchlist = () => {
  useDocumentTitle("Watchlist");
  const { user } = useAuth();
  const [items, setItems] = useState<WatchlistItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    
    let cancelled = false;
    
    (async () => {
      try {
        const data = await getWatchlist();
        if (!cancelled) {
          setItems(data);
        }
      } catch (e) {
        if (!cancelled) {
          setError((e as Error).message);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
  <>
    <SEO 
      title="My Watchlist"
      description="Your personal collection of movies and TV shows to watch. Keep track of content you want to see and never miss your favorites."
      keywords={['watchlist', 'my movies', 'saved shows', 'to watch', 'movie list']}
      url="https://cinephile.app/watchlist"
    />
    <div id="main" className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 container mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookmarkPlus className="w-10 h-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">
              My <span className="text-primary">Watchlist</span>
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Keep track of movies and shows you want to watch
          </p>
        </div>

        {!user && (
          <div className="text-center py-20 text-muted-foreground">Sign in to view your watchlist.</div>
        )}
        {error && (
          <div className="text-center py-4 text-destructive">{error}</div>
        )}
        {items && items.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {items.map((item) => (
              <div key={item.media_id} className="relative group">
                <MovieCard
                  id={item.media_id}
                  mediaType={item.media_type}
                  title={item.title}
                  year={item.year}
                  rating={item.rating}
                  imageUrl={item.image_url}
                />
                <button
                  onClick={async () => {
                    try {
                      await removeFromWatchlist(item.media_id);
                      setItems((prev) => (prev ? prev.filter((x) => x.media_id !== item.media_id) : prev));
                    } catch (e) {
                      setError((e as Error).message);
                    }
                  }}
                  className="absolute top-2 right-2 rounded-full bg-background/80 border border-border px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <BookmarkPlus className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your watchlist is empty</h3>
            <p className="text-muted-foreground">Start adding movies and shows to watch later</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  </>
  );
};

export default Watchlist;
