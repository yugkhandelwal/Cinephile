import { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

interface ContentSectionProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  onViewAll?: () => void;
}

const ContentSection = ({ title, subtitle, children, onViewAll }: ContentSectionProps) => {
  return (
    <section className="w-full py-8">
      <div className="pl-8 md:pl-16 lg:pl-24 pr-4">
        <div className="flex items-end justify-between mb-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground font-heading tracking-wide">{title}</h2>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          
          {onViewAll && (
            <button 
              onClick={onViewAll}
              className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors group"
            >
              <span className="font-medium hidden sm:inline">Explore All</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>
      
      <div className="relative w-full">
        <div className="flex overflow-x-auto gap-4 pl-8 md:pl-16 lg:pl-24 scroll-pl-8 md:scroll-pl-16 lg:scroll-pl-24 pr-8 pb-8 pt-4 snap-x snap-mandatory hide-scrollbar">
          {children && Array.isArray(children) 
            ? children.map((child, i) => (
                <div key={i} className="flex-none w-[160px] sm:w-[200px] md:w-[240px] snap-start">
                  {child}
                </div>
              ))
            : <div className="flex-none w-[160px] sm:w-[200px] md:w-[240px] snap-start">{children}</div>}
        </div>
        {/* Fade gradients for the edges */}
        <div className="absolute top-0 bottom-8 left-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute top-0 bottom-8 right-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
    </section>
  );
};

export default ContentSection;
