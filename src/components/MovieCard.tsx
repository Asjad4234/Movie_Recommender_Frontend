import type { Movie } from "../services/api";
import { useState } from "react";

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  const [posterError, setPosterError] = useState(false);

  return (
    <div className="movie-card relative flex-shrink-0 w-[200px] md:w-[240px] rounded-sm overflow-hidden cursor-pointer group">
      {/* Poster image or fallback gradient */}
      <div className="aspect-[2/3] bg-gradient-to-b from-secondary to-background relative overflow-hidden">
        {movie.poster_url && !posterError ? (
          <img
            src={movie.poster_url}
            alt={movie.title}
            className="w-full h-full object-cover"
            onError={() => setPosterError(true)}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-3">
            <span className="text-center text-sm font-medium text-muted-foreground leading-tight">
              {movie.title}
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
          <h3 className="text-sm font-bold text-foreground leading-tight mb-1 line-clamp-2">
            {movie.title}
          </h3>
          {movie.rating !== undefined && (
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs font-semibold text-green-400">
                ⭐ {typeof movie.rating === "number" ? movie.rating.toFixed(1) : movie.rating}
              </span>
            </div>
          )}
          {movie.genres && (
            <p className="text-xs text-muted-foreground line-clamp-1">{movie.genres}</p>
          )}
          {movie.similarity_score !== undefined && (
            <p className="text-xs text-blue-400 font-semibold">
              Match: {typeof movie.similarity_score === "number" ? (movie.similarity_score * 100).toFixed(0) : movie.similarity_score}%
            </p>
          )}
        </div>
      </div>

      {/* Title bar below poster */}
      <div className="bg-card p-2">
        <p className="text-xs text-foreground font-medium truncate">{movie.title}</p>
        {movie.rating !== undefined && (
          <p className="text-xs text-muted-foreground">
            ⭐ {typeof movie.rating === "number" ? movie.rating.toFixed(1) : movie.rating}
          </p>
        )}
      </div>
    </div>
  );
}
