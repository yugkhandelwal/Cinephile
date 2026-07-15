import { ReactNode, useRef, isValidElement, cloneElement } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface ContentSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onViewAll?: () => void;
  isLoading?: boolean;
  skeletonCount?: number;
}

const SkeletonCard = () => (
  <div className="flex-none w-[150px] sm:w-[200px] md:w-[260px] lg:w-[280px] snap-start">
    <div className="relative w-full aspect-[2/3] rounded-2xl bg-skeleton overflow-hidden">
      {/* Shimmer sweep */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
    {/* Metadata skeleton rows */}
    <div className="pt-3 px-1 flex flex-col gap-2">
      <div className="h-3.5 w-4/5 rounded-full bg-skeleton overflow-hidden relative">
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>
      <div className="h-2.5 w-2/5 rounded-full bg-skeleton overflow-hidden relative">
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>
    </div>
  </div>
);

const ContentSection = ({
  title,
  subtitle,
  children,
  onViewAll,
  isLoading = false,
  skeletonCount = 8,
}: ContentSectionProps) => {
  const railRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const el = railRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
  };

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.08, delayChildren: 0.1 },
        },
      }}
      className="w-full py-12 md:py-16"
    >
      <div className="pl-6 md:pl-12 lg:pl-16 pr-6">
        <div className="flex items-end justify-between mb-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground font-heading tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-base text-muted-foreground mt-1">{subtitle}</p>
            )}
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

      {/* Rail wrapper — group enables chevron visibility on hover */}
      <div className="relative w-full group/rail">
        {/* Left chevron */}
        <button
          onClick={() => scroll("left")}
          aria-label="Scroll left"
          className="
            absolute left-2 top-1/3 -translate-y-1/2 z-20
            hidden md:flex items-center justify-center
            w-10 h-10 rounded-full glass
            text-white/70 hover:text-white
            opacity-0 group-hover/rail:opacity-100
            scale-90 group-hover/rail:scale-100
            transition-all duration-300
            shadow-[0_4px_20px_rgba(0,0,0,0.5)]
          "
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Right chevron */}
        <button
          onClick={() => scroll("right")}
          aria-label="Scroll right"
          className="
            absolute right-2 top-1/3 -translate-y-1/2 z-20
            hidden md:flex items-center justify-center
            w-10 h-10 rounded-full glass
            text-white/70 hover:text-white
            opacity-0 group-hover/rail:opacity-100
            scale-90 group-hover/rail:scale-100
            transition-all duration-300
            shadow-[0_4px_20px_rgba(0,0,0,0.5)]
          "
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div
          ref={railRef}
          className="flex overflow-x-auto gap-6 pl-6 md:pl-12 lg:pl-16 scroll-pl-6 md:scroll-pl-12 lg:scroll-pl-16 pr-6 pb-8 pt-4 snap-x snap-mandatory hide-scrollbar"
        >
          {isLoading
            ? Array.from({ length: skeletonCount }).map((_, i) => (
                <SkeletonCard key={`skel-${i}`} />
              ))
            : Array.isArray(children)
            ? children.map((child: any, i) => (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, x: 30 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
                  }}
                  className="flex-none w-[150px] sm:w-[200px] md:w-[260px] lg:w-[280px] snap-start"
                >
                  {isValidElement(child) ? (
                    cloneElement(child as any, { enableParallax: true })
                  ) : (
                    child
                  )}
                </motion.div>
              ))
            : (
                <div className="flex-none w-[150px] sm:w-[200px] md:w-[260px] lg:w-[280px] snap-start">
                  {children}
                </div>
              )}
        </div>

        {/* Edge fade gradients */}
        <div className="absolute top-0 bottom-8 left-0 w-12 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute top-0 bottom-8 right-0 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
    </motion.section>
  );
};

export default ContentSection;
