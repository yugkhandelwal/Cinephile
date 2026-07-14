import Navbar from "@/shared/components/layout/Navbar";
import Footer from "@/shared/components/layout/Footer";
import ContentSection from "../home/ContentSection";
import MediaCard from "@/shared/components/MediaCard";
import { useAIRecommendations, useRecommendationsFromWatchlist } from "@/shared/api/tmdb/hooks";
import { useAuth } from "@/context/AuthProvider";
import { useEffect, useMemo, useState } from "react";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";

const Recommendations = () => {
  useDocumentTitle("Recommendations");
  const { user } = useAuth();
  const [mode, setMode] = useState<"ai" | "simple">(() => (localStorage.getItem("recsMode") as any) || "ai");
  const ai = useAIRecommendations();
  const simple = useRecommendationsFromWatchlist();

  useEffect(() => {
    localStorage.setItem("recsMode", mode);
  }, [mode]);

  return (
  <div id="main" className="min-h-screen bg-background pb-tabbar">

      <div className="pt-6 md:pt-24 container mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Recommendations</h1>
        {!user && <p className="text-muted-foreground">Sign in to see personalized recommendations.</p>}
        <div className="mb-6 flex items-center gap-3">
          <button onClick={() => setMode("ai")} className={`text-sm px-3 py-1 rounded-full border ${mode === 'ai' ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}>AI</button>
          <button onClick={() => setMode("simple")} className={`text-sm px-3 py-1 rounded-full border ${mode === 'simple' ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}>Simple</button>
        </div>

        {mode === "ai" ? (
          <>
            {ai.isLoading && <p className="text-muted-foreground">Analyzing your taste…</p>}
            {ai.isError && <p className="text-destructive">{String((ai.error as Error)?.message || 'Failed to load')}</p>}
            {ai.data?.items?.length ? (
              <>
                {ai.data.rationale.topGenres.length > 0 && (
                  <div className="mb-6 flex flex-wrap gap-2">
                    {ai.data.rationale.topGenres.map((g) => (
                      <span key={g.id} className="text-xs px-3 py-1 rounded-full border border-primary/40 text-primary">
                        {g.name} · {g.score}
                      </span>
                    ))}
                  </div>
                )}
                <ContentSection title="AI Picks for You" subtitle="Based on your watchlist and likes">
                  {ai.data.items.map((m) => (
                    <div key={`${m.mediaType}-${m.id}`} className="space-y-1">
                      <MediaCard {...m} />
                      {ai.data.reasons?.[m.id!] && (
                        <div className="text-[11px] text-muted-foreground pl-1">
                          {ai.data.reasons[m.id!].slice(0,2).map((r, i) => (
                            <span key={i} className="mr-2">• {r}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </ContentSection>
              </>
            ) : null}
          </>
        ) : (
          <>
            {simple.isLoading && <p className="text-muted-foreground">Collecting similar titles…</p>}
            {simple.isError && <p className="text-destructive">{String((simple.error as Error)?.message || 'Failed to load')}</p>}
            {!!simple.data?.length && (
              <ContentSection title="Because you saved" subtitle="Movies and shows you might like">
                {simple.data.map((m) => (
                  <MediaCard key={`${m.mediaType}-${m.id}`} {...m} />
                ))}
              </ContentSection>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Recommendations;
