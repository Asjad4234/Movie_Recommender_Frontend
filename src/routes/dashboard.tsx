import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Navbar } from "../components/Navbar";
import { RowSlider } from "../components/RowSlider";
import { MovieDetailModal } from "../components/MovieDetailModal";
import { AvatarSelector } from "../components/AvatarSelector";
import { useApp } from "../context/AppContext";
import { useMyList } from "../hooks/useMyList";
import { getPopularMovies, getRecommendations, getHybridRecommendations, getRecommendationsFromMyList, getRecommendationsByGenres, searchMovies } from "../services/api";
import type { Movie } from "../services/api";

const ALL_GENRES = [
  "Action", "Adventure", "Animation", "Children's", "Comedy", "Crime",
  "Documentary", "Drama", "Fantasy", "Film-Noir", "Horror", "Musical",
  "Mystery", "Romance", "Sci-Fi", "Thriller", "War", "Western",
];

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
    setSelectedUser,
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
    newProfile,
    setNewProfile,
  } = useApp();

  const [showControls, setShowControls] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showMovieDetail, setShowMovieDetail] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load avatar for the current user
  useEffect(() => {
    if (selectedUserId) {
      const saved = localStorage.getItem(`avatar_${selectedUserId}`);
      setAvatarUrl(saved);
    }
  }, [selectedUserId]);

  const handleAvatarSelect = (url: string) => {
    setAvatarUrl(url);
    if (selectedUserId) {
      localStorage.setItem(`avatar_${selectedUserId}`, url);
    }
    setShowAvatarSelector(false);
    toast.success("Avatar updated!");
  };

  const { myList } = useMyList();
  const [myListRecs, setMyListRecs] = useState<Movie[]>([]);
  const [isMyListLoading, setIsMyListLoading] = useState(false);
  const [genreRecs, setGenreRecs] = useState<Movie[]>([]);
  const [isGenreRecsLoading, setIsGenreRecsLoading] = useState(false);

  // Onboarding state
  const [setupStep, setSetupStep] = useState<"none" | "profile" | "genres">("none");
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#E50914");
  const [selectedGenres, setSelectedGenres] = useState<Set<string>>(new Set());
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);

  // Helper to generate row labels based on recommendation source
  const getRowLabel = (source: string | undefined, queryTitle?: string): string => {
    switch (source) {
      case 'item_based':
      case 'collaborative':
        return queryTitle ? `Because you searched for ${queryTitle}` : 'Movie-Based Recommendations';
      case 'user_based':
        return 'Users like you also watched';
      case 'hybrid':
      case 'hybrid_with_content':
        return queryTitle ? `Movies in the spirit of ${queryTitle}` : 'Personalized For You';
      case 'content_based':
        return queryTitle ? `More like ${queryTitle} by genre` : 'Similar By Genre';
      case 'genre_based':
        return 'Picked for you based on your taste';
      case 'my_list':
        return 'Because you saved these';
      case 'popular':
        return 'Most Watched';
      default:
        return 'Recommended for you';
    }
  };

  // Listen for the "Set up profile" button from Navbar
  useEffect(() => {
    const handleTrigger = () => setSetupStep("profile");
    window.addEventListener("trigger-profile-setup", handleTrigger);
    return () => window.removeEventListener("trigger-profile-setup", handleTrigger);
  }, []);

  // Fetch popular movies from /popular endpoint (ranked by rating_count × avg_rating)
  useEffect(() => {
    const fetchPopular = async () => {
      setIsPopularLoading(true);
      try {
        const movies = await getPopularMovies();
        setPopularMovies(Array.isArray(movies) ? movies : []);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load popular movies");
      } finally {
        setIsPopularLoading(false);
      }
    };
    fetchPopular();
  }, []);

  // Fetch genre-based cold-start recommendations if genre prefs exist
  useEffect(() => {
    if (!selectedUserId) return;
    const storageKey = `genre_prefs_${selectedUserId}`;
    const saved = localStorage.getItem(storageKey);
    if (!saved) return;

    const fetchGenreRecs = async () => {
      setIsGenreRecsLoading(true);
      try {
        const genres: string[] = JSON.parse(saved);
        const data = await getRecommendationsByGenres(genres, 20);
        setGenreRecs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch genre recommendations:", err);
      } finally {
        setIsGenreRecsLoading(false);
      }
    };
    fetchGenreRecs();
  }, [selectedUserId]);

  // Fetch My List recommendations when myList changes
  useEffect(() => {
    const fetchMyListRecs = async () => {
      if (myList.length === 0) {
        setMyListRecs([]);
        return;
      }
      setIsMyListLoading(true);
      try {
        const titles = myList.map(m => m.title);
        const data = await getRecommendationsFromMyList(titles, 10);
        setMyListRecs(data);
      } catch (err) {
        console.error("Failed to fetch my list recommendations:", err);
      } finally {
        setIsMyListLoading(false);
      }
    };
    fetchMyListRecs();
  }, [myList]);

  // Fetch suggestions with debounce
  useEffect(() => {
    if (localSearch.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await searchMovies(localSearch);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
        setSuggestionIndex(-1);
      } catch (err) {
        console.error("Suggestions fetch failed", err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [localSearch]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const triggerSearch = useCallback(async (title: string) => {
    if (!title.trim()) return;
    setSearchQuery(title);
    setShowSuggestions(false);

    // Movie-based recommendations
    setIsLoading(true);
    try {
      const data = await getRecommendations({ title: title.trim(), top_n: topN });
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
          title: title.trim(),
          top_n: topN,
          item_weight: itemWeight,
          user_weight: userWeight,
        });
        setHybridRecommendations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Hybrid search failed:", err);
        setHybridRecommendations([]);
      } finally {
        setIsHybridLoading(false);
      }
    }
  }, [selectedUserId, topN, itemWeight, userWeight, setRecommendations, setHybridRecommendations, setIsLoading, setIsHybridLoading, setSearchQuery]);

  const handleSelectSuggestion = (movie: Movie) => {
    setLocalSearch(movie.title);
    triggerSearch(movie.title);
  };

  // Auto-refresh recommendations when advanced controls change
  useEffect(() => {
    if (!searchQuery) return;
    
    const timer = setTimeout(() => {
      triggerSearch(searchQuery);
    }, 400); // Wait 400ms after user stops sliding

    return () => clearTimeout(timer);
  }, [topN, itemWeight, userWeight, searchQuery, triggerSearch]);

  const handleSearch = () => {
    triggerSearch(localSearch);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSuggestionIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSuggestionIndex(prev => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === "Enter" && suggestionIndex >= 0) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[suggestionIndex]);
      } else if (e.key === "Enter") {
        handleSearch();
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    } else if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleFinishOnboarding = () => {
    if (!newName || selectedGenres.size < 3) return;
    
    // Create new user ID (starting from 1001)
    const newId = Math.max(1000, Date.now() % 1000000);
    
    // Save genre prefs
    localStorage.setItem(`genre_prefs_${newId}`, JSON.stringify(Array.from(selectedGenres)));
    
    // Set user (this saves to localStorage and updates context)
    setSelectedUser(newId, newName);
    setNewProfile({ id: newId, name: newName, color: newColor });
    
    // Clear onboarding state
    setSetupStep("none");
    setNewName("");
    setSelectedGenres(new Set());
    
    toast.success(`Welcome to MovieFlix, ${newName}!`);
  };

  // ── Profile Creation & Genre Onboarding Views ──────────────────
  if (!isMounted) return <div className="min-h-screen bg-background" />; // Prevent flash

  if (setupStep !== "none") {
    return (
      <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
        <div className="max-w-xl w-full bg-card p-8 rounded-xl border border-border shadow-2xl animate-in fade-in zoom-in duration-300">
          
          {setupStep === "profile" ? (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-foreground">Create your profile</h2>
                <p className="text-muted-foreground mt-2">Enter your name to get started</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">Profile Name</label>
                  <input
                    type="text"
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Alex"
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">Pick a color</label>
                  <div className="flex gap-3">
                    {["#E50914", "#0071EB", "#46D369", "#E87C03", "#B9090B"].map(c => (
                      <button
                        key={c}
                        onClick={() => setNewColor(c)}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${newColor === c ? "border-white scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setSetupStep("none")}
                  className="flex-1 px-6 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={!newName.trim()}
                  onClick={() => setSetupStep("genres")}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                >
                  Next: Pick Genres
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-foreground">What do you like?</h2>
                <p className="text-muted-foreground mt-2">Pick at least 3 genres for personalized picks</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ALL_GENRES.map(g => {
                  const active = selectedGenres.has(g);
                  return (
                    <button
                      key={g}
                      onClick={() => {
                        const next = new Set(selectedGenres);
                        if (next.has(g)) next.delete(g); else next.add(g);
                        setSelectedGenres(next);
                      }}
                      className={`px-3 py-2 rounded-md text-sm font-medium border transition-all ${active ? "bg-primary border-primary text-white shadow-md shadow-primary/20" : "bg-secondary border-border text-muted-foreground hover:border-muted-foreground/50"}`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setSetupStep("profile")}
                  className="px-6 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
                >
                  Back
                </button>
                <button
                  disabled={selectedGenres.size < 3}
                  onClick={handleFinishOnboarding}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                >
                  Finish ({selectedGenres.size}/3)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Avatar Selector Modal */}
      {showAvatarSelector && (
        <AvatarSelector
          onSelect={handleAvatarSelect}
          onCancel={() => setShowAvatarSelector(false)}
        />
      )}

      <Navbar 
        avatarUrl={avatarUrl} 
        onAvatarClick={() => setShowAvatarSelector(true)}
      />

      {/* Search section */}
      <div className="pt-24 pb-6 px-4 md:px-12">
        <div className="max-w-2xl mx-auto relative" ref={searchRef}>
          <div className="flex gap-2">
            <input
              type="text"
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => localSearch.length >= 2 && setShowSuggestions(true)}
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

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded shadow-2xl z-[60] overflow-hidden animate-fade-in">
              {suggestions.map((movie, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSuggestion(movie)}
                  onMouseEnter={() => setSuggestionIndex(idx)}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-left transition-colors ${
                    idx === suggestionIndex ? "bg-primary/10 text-primary" : "hover:bg-secondary text-foreground"
                  }`}
                >
                  {movie.poster_url ? (
                    <img src={movie.poster_url} className="w-7 h-10 rounded-sm object-cover" alt="" />
                  ) : (
                    <div className="w-7 h-10 rounded-sm bg-secondary flex items-center justify-center text-[8px] text-muted-foreground">
                      No Art
                    </div>
                  )}
                  <span className="text-sm font-medium line-clamp-1">{movie.title}</span>
                </button>
              ))}
            </div>
          )}

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
        <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-lg p-6 border border-primary/10">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {selectedUserName ? `Welcome back, ${selectedUserName}` : "Welcome to MovieFlix"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedUserName 
              ? "We've found some new movies you might like." 
              : "Set up a profile to get personalized recommendations and save your list."}
          </p>
          {(!selectedUserId || selectedUserId === 1000) && (
            <button
              onClick={() => setSetupStep("profile")}
              className="mt-4 bg-primary/20 hover:bg-primary/30 text-primary text-xs font-bold px-4 py-2 rounded transition-all border border-primary/20"
            >
              Get Personalized →
            </button>
          )}
        </div>
      </div>

      {/* Movie rows */}
      <div className="pb-12">
        {/* Movie-based recommendations */}
        {(recommendations.length > 0 || isLoading) && (
          <RowSlider
            title={getRowLabel('item_based', searchQuery)}
            movies={recommendations}
            isLoading={isLoading}
            onMovieClick={(movie) => {
              setSelectedMovie(movie);
              setShowMovieDetail(true);
            }}
          />
        )}

        {/* Hybrid recommendations */}
        {selectedUserId && selectedUserId !== 1000 && (hybridRecommendations.length > 0 || isHybridLoading) && (
          <RowSlider
            title={getRowLabel('hybrid', searchQuery)}
            movies={hybridRecommendations}
            isLoading={isHybridLoading}
            onMovieClick={(movie) => {
              setSelectedMovie(movie);
              setShowMovieDetail(true);
            }}
          />
        )}

        {/* My List Based Recommendations */}
        {selectedUserId && selectedUserId !== 1000 && (myListRecs.length > 0 || isMyListLoading) && (
          <RowSlider
            title={getRowLabel('my_list')}
            movies={myListRecs}
            isLoading={isMyListLoading}
            onMovieClick={(movie) => {
              setSelectedMovie(movie);
              setShowMovieDetail(true);
            }}
          />
        )}

        {/* Genre-based cold-start recommendations */}
        {selectedUserId && selectedUserId !== 1000 && (genreRecs.length > 0 || isGenreRecsLoading) && (
          <RowSlider
            title={getRowLabel('genre_based')}
            movies={genreRecs}
            isLoading={isGenreRecsLoading}
            onMovieClick={(movie) => {
              setSelectedMovie(movie);
              setShowMovieDetail(true);
            }}
          />
        )}

        {/* Popular movies (ranked by popularity score) */}
        <RowSlider
          title={getRowLabel('popular')}
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
