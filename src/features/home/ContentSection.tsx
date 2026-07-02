import { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface ContentSectionProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  onViewAll?: () => void;
}

const ContentSection = ({ title, subtitle, children, onViewAll }: ContentSectionProps) => {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full py-12 md:py-16"
    >
      <div className="pl-6 md:pl-12 lg:pl-16 pr-6">
        <div className="flex items-end justify-between mb-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground font-heading tracking-tight">{title}</h2>
            {subtitle && <p className="text-base text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          
          {onViewAll && (
            <button 
              onClick={onViewAll}
              className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors group"
            >
              <span className="hidden sm:inline">Explore All</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>
      
      <div className="relative w-full">
        <div 
          className="flex overflow-x-auto gap-6 pl-6 md:pl-12 lg:pl-16 scroll-pl-6 md:scroll-pl-12 lg:scroll-pl-16 pr-6 pb-8 pt-4 snap-x snap-mandatory hide-scrollbar"
        >
          {children && Array.isArray(children) 
            ? children.map((child, i) => (
                <div 
                  key={i} 
                  className="flex-none w-[180px] sm:w-[220px] md:w-[260px] lg:w-[280px] snap-start"
                >
                  {child}
                </div>
              ))
            : <div 
                className="flex-none w-[180px] sm:w-[220px] md:w-[260px] lg:w-[280px] snap-start"
              >
                {children}
              </div>}
        </div>
        {/* Fade gradients for the edges */}
        <div className="absolute top-0 bottom-8 left-0 w-12 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute top-0 bottom-8 right-0 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
    </motion.section>
  );
};

export default ContentSection;
