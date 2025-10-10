import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window { gtag?: (...args: any[]) => void }
}

export default function Analytics() {
  const location = useLocation();
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', { page_location: window.location.href, page_path: location.pathname + location.search });
    }
  }, [location.pathname, location.search]);
  return null;
}