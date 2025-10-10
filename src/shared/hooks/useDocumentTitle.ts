import { useEffect } from "react";

export function useDocumentTitle(title: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} • Cinephile` : "Cinephile";
    return () => { document.title = prev; };
  }, [title]);
}

export default useDocumentTitle;