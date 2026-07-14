import React, { createContext, useContext, useEffect, useState } from "react";

export type ContentMode = "movies" | "anime";

interface ContentModeContextType {
  mode: ContentMode;
  setMode: (mode: ContentMode) => void;
}

const ContentModeContext = createContext<ContentModeContextType | undefined>(undefined);

export const ContentModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ContentMode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cinephile_content_mode");
      if (saved === "movies" || saved === "anime") {
        return saved;
      }
    }
    return "movies";
  });

  const setMode = (newMode: ContentMode) => {
    setModeState(newMode);
    localStorage.setItem("cinephile_content_mode", newMode);
  };

  return (
    <ContentModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ContentModeContext.Provider>
  );
};

export const useContentMode = () => {
  const context = useContext(ContentModeContext);
  if (context === undefined) {
    throw new Error("useContentMode must be used within a ContentModeProvider");
  }
  return context;
};
