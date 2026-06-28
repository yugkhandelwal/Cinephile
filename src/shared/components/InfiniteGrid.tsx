import React, { useEffect, useMemo, useRef } from "react";
import { Skeleton } from "@/shared/components/ui/skeleton";

type InfiniteGridProps<T> = {
  title?: string;
  subtitle?: string;
  pages: T[][] | undefined;
  renderItem: (item: T) => React.ReactNode;
  isLoading: boolean;
  isError: boolean;
  fetchNextPage: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  loaderCount?: number;
  emptyText?: string;
  onRetry?: () => void;
};

export function InfiniteGrid<T>(props: InfiniteGridProps<T>) {
  const {
    title,
    subtitle,
    pages,
    renderItem,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    loaderCount = 10,
    emptyText = "Nothing to show",
    onRetry,
  } = props;

  const items = useMemo(() => (pages ? ([] as T[]).concat(...pages) : []), [pages]);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        });
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className="w-full">
      {/* Header Section */}
      {(title || subtitle) && (
        <div className="mb-8">
          {subtitle && (
            <p className="text-sm text-primary font-medium mb-2">{subtitle}</p>
          )}
          {title && (
            <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && items.length === 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {Array.from({ length: loaderCount }).map((_, i) => (
            <div key={i} className="w-full">
              <Skeleton className="w-full aspect-[2/3] rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="flex items-center gap-3 text-destructive py-8">
          <span>Failed to load content.</span>
          {onRetry && (
            <button 
              onClick={onRetry} 
              className="px-4 py-2 text-sm border border-border rounded hover:bg-accent transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && items.length === 0 && (
        <div className="text-muted-foreground py-8 text-center">{emptyText}</div>
      )}

      {/* Grid Content */}
      {!isLoading && !isError && items.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {items.map((item, idx) => (
              <div key={idx} className="w-full">
                {renderItem(item)}
              </div>
            ))}
          </div>

          {/* Load More Section */}
          <div className="flex items-center justify-center py-8 mt-4">
            {isFetchingNextPage && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">Loading more…</span>
              </div>
            )}
            {!isFetchingNextPage && hasNextPage && (
              <button 
                onClick={fetchNextPage} 
                className="px-6 py-2 border border-border rounded-lg text-sm hover:bg-accent hover:border-primary transition-all"
              >
                Load More
              </button>
            )}
            {!hasNextPage && items.length > 0 && (
              <span className="text-sm text-muted-foreground">No more items to load</span>
            )}
          </div>
        </>
      )}

      {/* Intersection Observer Sentinel */}
      <div ref={sentinelRef} className="h-1" />
    </div>
  );
}

export default InfiniteGrid;
