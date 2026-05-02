import { useRef, useState } from "react";
import { MovieCard } from "./MovieCard";
import type { Movie } from "../services/api";

interface RowSliderProps {
  title: string;
  icon?: string;
  movies: Movie[];
  isLoading?: boolean;
}

function SkeletonCard() {
  return (
    <div className="flex-shrink-0 w-[200px] md:w-[240px] rounded-sm overflow-hidden animate-pulse">
      <div className="aspect-[2/3] bg-secondary" />
      <div className="bg-card p-2 space-y-1">
        <div className="h-3 bg-secondary rounded w-3/4" />
        <div className="h-3 bg-secondary rounded w-1/2" />
      </div>
    </div>
  );
}

export function RowSlider({ title, icon, movies, isLoading }: RowSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 20);
    setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 20);
  };

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <div className="mb-8 animate-row-slide">
      <h2 className="text-lg md:text-xl font-bold text-foreground mb-3 px-4 md:px-12 flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {title}
      </h2>

      <div className="relative group/row">
        {/* Left arrow */}
        {showLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-0 z-10 w-10 md:w-12 bg-gradient-to-r from-background/90 to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
          >
            <svg className="w-6 h-6 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Right arrow */}
        {showRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-0 z-10 w-10 md:w-12 bg-gradient-to-l from-background/90 to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
          >
            <svg className="w-6 h-6 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="scroll-row flex gap-2 overflow-x-auto px-4 md:px-12 py-2"
        >
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : movies.length === 0
              ? (
                <div className="flex items-center justify-center w-full py-8">
                  <p className="text-muted-foreground text-sm">No movies to show</p>
                </div>
              )
              : movies.map((movie, i) => <MovieCard key={`${movie.title}-${i}`} movie={movie} />)
          }
        </div>
      </div>
    </div>
  );
}
