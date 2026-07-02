import { ReactNode } from "react";

export const PageTransition = ({ children }: { children: ReactNode }) => {
  return (
    <div className="w-full h-full min-h-screen">
      {children}
    </div>
  );
};
