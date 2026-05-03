import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Navbar } from "../components/Navbar";
import { RowSlider } from "../components/RowSlider";
import { MovieDetailModal } from "../components/MovieDetailModal";
import { useApp } from "../context/AppContext";
import { getMovies, getRecommendations, getHybridRecommendations } from "../services/api";
import type { Movie } from "../services/api";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Dashboard — MovieFlix" },
      { name: "description", content: "Browse and discover movie recommendations" },
    ],
  }),
});

function DashboardPage() {
  const navigate = useNavigate();
  const {
    selectedUserId,
    selectedUserName,
    searchQuery,
    setSearchQuery,
    recommendations,
    setRecommendations,
    hybridRecommendations,
    setHybridRecommendations,
    popularMovies,
    setPopularMovies,
    isLoading,
    setIsLoading,
    isHybridLoading,
    setIsHybridLoading,
    isPopularLoading,
    setIsPopularLoading,
    topN,
    setTopN,
    itemWeight,
    setItemWeight,
    userWeight,
    setUserWeight,
  } = useApp();

  const [showControls, setShowControls] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showMovieDetail, setShowMovieDetail] = useState(false);

  // Redirect if no user selected
  useEffect(() => {
    if (!selectedUserId) {
      navigate({ to: "/profiles" });
    }
  }, [selectedUserId, navigate]);

  // Fetch popular movies on mount
  useEffect(() => {
    const fetchPopular = async () => {
      setIsPopularLoading(true);
      try {
        const movies = await getMovies();
        setPopularMovies(Array.isArray(movies) ? movies.slice(0, 20) : []);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load popular movies");
      } finally {
        setIsPopularLoading(false);
      }
    };
    fetchPopular();
  }, []);

  const handleSearch = useCallback(async () => {
    if (!localSearch.trim()) {
      toast.error("Please enter a movie name");
      return;
    }

    setSearchQuery(localSearch);

    // Movie-based recommendations
    setIsLoading(true);
    try {
      const data = await getRecommendations({ title: localSearch.trim(), top_n: topN });
      setRecommendations(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to get recommendations");
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }

    // Hybrid recommendations
    if (selectedUserId) {
      setIsHybridLoading(true);
      try {
        const data = await getHybridRecommendations({
          user_id: selectedUserId,
          title: localSearch.trim(),
          top_n: topN,
          item_weight: itemWeight,
          user_weight: userWeight,
        });
        setHybridRecommendations(Array.isArray(data) ? data : []);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to get hybrid recommendations");
        setHybridRecommendations([]);
      } finally {
        setIsHybridLoading(false);
      }
    }
  }, [localSearch, topN, selectedUserId, itemWeight, userWeight]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  if (!selectedUserId) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Search section */}
      <div className="pt-24 pb-6 px-4 md:px-12">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search for a movie..."
              className="flex-1 bg-secondary text-foreground placeholder:text-muted-foreground rounded px-4 py-3 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {isLoading ? "Searching..." : "Get Recommendations"}
            </button>
          </div>

          {/* Controls toggle */}
          <button
            onClick={() => setShowControls(!showControls)}
            className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <svg
              className={`w-3 h-3 transition-transform ${showControls ? "rotate-90" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            Advanced Controls
          </button>

          {/* Controls panel */}
          {showControls && (
            <div className="mt-3 p-4 bg-card rounded border border-border space-y-4 animate-fade-in">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Results count (top_n): {topN}
                </label>
                <select
                  value={topN}
                  onChange={(e) => setTopN(Number(e.target.value))}
                  className="bg-secondary text-foreground text-sm rounded px-3 py-1.5 border border-border"
                >
                  {[5, 10, 15, 20].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Item Weight: {itemWeight.toFixed(2)}
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={itemWeight}
                  onChange={(e) => setItemWeight(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  User Weight: {userWeight.toFixed(2)}
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={userWeight}
                  onChange={(e) => setUserWeight(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Welcome banner */}
      <div className="px-4 md:px-12 mb-6">
        <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-lg p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Welcome back, {selectedUserName}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Search for a movie to get personalized recommendations
          </p>
        </div>
      </div>

      {/* Movie rows */}
      <div className="pb-12">
        {/* Movie-based recommendations */}
        {(recommendations.length > 0 || isLoading) && (
          <RowSlider
            title="Movie-Based Recommendations"
            movies={recommendations}
            isLoading={isLoading}
            onMovieClick={(movie) => {
              setSelectedMovie(movie);
              setShowMovieDetail(true);
            }}
          />
        )}

        {/* Hybrid recommendations */}
        {(hybridRecommendations.length > 0 || isHybridLoading) && (
          <RowSlider
            title="Personalized For You"
            movies={hybridRecommendations}
            isLoading={isHybridLoading}
            onMovieClick={(movie) => {
              setSelectedMovie(movie);
              setShowMovieDetail(true);
            }}
          />
        )}

        {/* Popular movies */}
        <RowSlider
          title="Popular Movies"
          movies={popularMovies}
          isLoading={isPopularLoading}
          onMovieClick={(movie) => {
            setSelectedMovie(movie);
            setShowMovieDetail(true);
          }}
        />
      </div>

      {/* Movie Detail Modal */}
      <MovieDetailModal 
        movie={selectedMovie}
        isOpen={showMovieDetail}
        onClose={() => {
          setShowMovieDetail(false);
          setSelectedMovie(null);
        }}
      />
    </div>
  );
}
