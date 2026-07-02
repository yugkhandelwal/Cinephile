import { useState, useEffect } from 'react';

export interface VibrantColors {
  Vibrant?: string;
  DarkVibrant?: string;
}

export const useVibrant = (imageUrl?: string | null) => {
  const [colors, setColors] = useState<VibrantColors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const extractColors = async () => {
      if (!imageUrl) {
        setColors({});
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Important for CORS
        img.src = imageUrl;

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        // Create canvas to extract colors
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');
        
        // Scale down for performance
        canvas.width = 100;
        canvas.height = Math.floor((img.height / img.width) * 100);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Simple dominant color extraction by averaging pixels
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        let r = 0, g = 0, b = 0;
        let count = 0;
        
        // Step through pixels
        for (let i = 0; i < data.length; i += 4) {
          // Ignore highly transparent pixels or pure black/white
          if (data[i + 3] < 128) continue;
          if (data[i] > 250 && data[i+1] > 250 && data[i+2] > 250) continue;
          if (data[i] < 15 && data[i+1] < 15 && data[i+2] < 15) continue;
          
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
        
        if (count > 0) {
          r = Math.floor(r / count);
          g = Math.floor(g / count);
          b = Math.floor(b / count);
          
          // Boost vibrancy to match Node-Vibrant's vibrant feel
          const max = Math.max(r, g, b);
          if (max > 0 && max < 255) {
            const boost = Math.min(255 / max, 1.5); // Boost up to 1.5x
            r = Math.min(255, Math.floor(r * boost));
            g = Math.min(255, Math.floor(g * boost));
            b = Math.min(255, Math.floor(b * boost));
          }
          
          const dr = Math.floor(r * 0.25);
          const dg = Math.floor(g * 0.25);
          const db = Math.floor(b * 0.25);
          
          if (isMounted) {
            setColors({
              Vibrant: `rgb(${r}, ${g}, ${b})`,
              DarkVibrant: `rgb(${dr}, ${dg}, ${db})`,
            });
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to extract colors:", err);
          setError(err instanceof Error ? err : new Error('Failed to extract colors'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    extractColors();

    return () => {
      isMounted = false;
    };
  }, [imageUrl]);

  return { colors, loading, error };
};
