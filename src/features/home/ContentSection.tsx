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
    <section className="w-full py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm text-primary font-medium mb-2">{subtitle}</p>
          <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>
        </div>
        
        {onViewAll && (
          <button 
            onClick={onViewAll}
            className="flex items-center gap-2 text-primary hover:gap-3 transition-all duration-300 group"
          >
            <span className="font-medium">View All</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
        {children}
      </div>
    </section>
  );
};

export default ContentSection;
