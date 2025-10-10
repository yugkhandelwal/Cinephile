import { useEffect, useState } from "react";

interface ContentRailProps {
  images: string[];
  direction?: "left" | "right";
  speed?: number;
}

const ContentRail = ({ images, direction = "left", speed = 30 }: ContentRailProps) => {
  const [duplicatedImages, setDuplicatedImages] = useState<string[]>([]);

  useEffect(() => {
    // Duplicate images to create seamless loop
    setDuplicatedImages([...images, ...images, ...images]);
  }, [images]);

  return (
    <div className="relative overflow-hidden h-full w-full">
      <div
        className={`flex gap-4 ${direction === "left" ? "animate-scroll-left" : "animate-scroll-right"}`}
        style={{
          animationDuration: `${speed}s`,
          width: "max-content",
        }}
      >
        {duplicatedImages.map((img, idx) => (
          <div
            key={idx}
            className="flex-shrink-0 w-40 md:w-48 lg:w-56 rounded-lg overflow-hidden shadow-xl"
          >
            <img
              src={img}
              alt=""
              loading="lazy"
              className="w-full h-full object-cover opacity-79 hover:opacity-90 transition-opacity duration-300"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentRail;
