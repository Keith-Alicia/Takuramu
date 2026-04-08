"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface Photo {
  id?: string;
  storage_url: string;
}

interface PhotoCarouselProps {
  photos: Photo[];
  index?: number;
}

export function PhotoCarousel({ photos, index = 0 }: PhotoCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Track scroll position to update current index
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollPosition = container.scrollLeft;
      const width = container.clientWidth;
      if (width === 0) return;
      const newIndex = Math.round(scrollPosition / width);
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < photos.length) {
        setCurrentIndex(newIndex);
      }
    };

    // Use a small timeout to ensure initial layout is done
    const timeoutId = setTimeout(handleScroll, 100);
    
    container.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      clearTimeout(timeoutId);
      container.removeEventListener("scroll", handleScroll);
    };
  }, [currentIndex, photos.length]);

  const scrollTo = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const newScrollPosition = direction === 'left' 
      ? container.scrollLeft - width 
      : container.scrollLeft + width;

    container.scrollTo({
      left: newScrollPosition,
      behavior: 'smooth'
    });
  };

  if (!photos || photos.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground font-light text-sm">
        No Photo
      </div>
    );
  }

  // To hide scrollbar on webkit browsers, we can use a wrapper or global css.
  // Here we use inline styles for firefox/ie and tailwind classes for webkit if configured,
  // but standard CSS approach is best.
  return (
    <div className="relative w-full h-full group">
      {/* CSS to hide scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
      
      {/* Scrollable Container */}
      <div 
        ref={scrollContainerRef}
        className="w-full h-full flex overflow-x-auto snap-x snap-mandatory hide-scrollbar" 
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {photos.map((photo, i) => (
          <div key={photo.id || i} className="w-full h-full flex-shrink-0 relative snap-center">
            <Image 
              src={photo.storage_url} 
              alt={`Photo ${i + 1} for place ${index + 1}`} 
              fill 
              className="object-cover"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Controls & Indicators */}
      {photos.length > 1 && (
        <>
          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 p-1.5 rounded-full bg-black/20 backdrop-blur-sm pointer-events-none z-10">
            {photos.map((_, i) => (
              <div 
                key={i} 
                className={`h-2 rounded-full transition-all duration-300 shadow-sm ${
                  i === currentIndex ? "bg-white w-4" : "bg-white/50 w-2"
                }`} 
              />
            ))}
          </div>

          {/* Text Indicator */}
          <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm font-medium pointer-events-none z-10 shadow-sm border border-white/10">
            {currentIndex + 1} / {photos.length}
          </div>

          {/* Navigation Arrows (Desktop/Touch) */}
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); scrollTo('left'); }}
            className={`absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white transition-opacity duration-300 z-10 shadow-sm border border-white/10 ${currentIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); scrollTo('right'); }}
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white transition-opacity duration-300 z-10 shadow-sm border border-white/10 ${currentIndex === photos.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            aria-label="Next photo"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </>
      )}
    </div>
  );
}
