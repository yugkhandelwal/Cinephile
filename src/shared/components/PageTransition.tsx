import { ReactNode } from "react";
import { motion } from "framer-motion";

export const PageTransition = ({ children }: { children: ReactNode }) => {
  return (
    <motion.div 
      initial={{ scale: 1.02, opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.98, opacity: 0, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full h-full min-h-screen origin-center"
    >
      {children}
    </motion.div>
  );
};
