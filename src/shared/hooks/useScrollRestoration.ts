import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function useScrollRestoration(keyPrefix: string) {
  const loc = useLocation();
  const key = `${keyPrefix}:${loc.pathname}${loc.search}`;

  useEffect(() => {
    const saved = sessionStorage.getItem(key);
    if (saved) {
      const y = Number(saved);
      if (!Number.isNaN(y)) {
        requestAnimationFrame(() => window.scrollTo({ top: y }));
      }
    }
    const onScroll = () => sessionStorage.setItem(key, String(window.scrollY));
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [key]);
}
