import { ReactNode, useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Loader2, ArrowDown } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export const PullToRefresh = ({ children }: { children: ReactNode }) => {
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const controls = useAnimation();
  
  const pullProgress = useRef(0);
  const startY = useRef(0);
  const isDragging = useRef(false);
  
  const MAX_PULL = 120;
  const THRESHOLD = 80;

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY > 5) return; // Only allow at top of page
      startY.current = e.touches[0].clientY;
      isDragging.current = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current || refreshing || window.scrollY > 5) return;
      
      const y = e.touches[0].clientY;
      const delta = y - startY.current;
      
      if (delta > 0) {
        // Prevent default scrolling when pulling down
        if (e.cancelable) e.preventDefault();
        
        const pull = Math.min(delta * 0.4, MAX_PULL);
        pullProgress.current = pull;
        controls.set({ y: pull });
      }
    };

    const handleTouchEnd = async () => {
      if (!isDragging.current || refreshing) return;
      isDragging.current = false;
      
      if (pullProgress.current >= THRESHOLD) {
        setRefreshing(true);
        controls.start({ y: 60, transition: { type: "spring", stiffness: 300, damping: 20 } });
        
        try {
          await queryClient.refetchQueries();
          // Artificial delay for UX
          await new Promise(r => setTimeout(r, 800));
        } finally {
          setRefreshing(false);
          pullProgress.current = 0;
          controls.start({ y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
        }
      } else {
        pullProgress.current = 0;
        controls.start({ y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
      }
    };

    // Attach passive: false to prevent default browser behavior
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [refreshing, controls, queryClient]);

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Pull indicator layer */}
      <div className="absolute top-0 left-0 right-0 h-[60px] flex items-center justify-center -z-10 text-white/50">
        {refreshing ? (
          <div className="flex items-center gap-2 text-primary font-medium">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Refreshing...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <ArrowDown className="w-5 h-5 animate-bounce" />
            <span className="text-sm">Pull to refresh</span>
          </div>
        )}
      </div>

      {/* Content layer that gets pulled down */}
      <motion.div
        animate={controls}
        className="w-full min-h-screen bg-background z-10"
      >
        {children}
      </motion.div>
    </div>
  );
};
