import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ProfileCard } from "../components/ProfileCard";
import { useApp } from "../context/AppContext";

export const Route = createFileRoute("/profiles")({
  component: ProfilesPage,
  head: () => ({
    meta: [
      { title: "Select Profile — MovieFlix" },
      { name: "description", content: "Choose your profile to get personalized recommendations" },
    ],
  }),
});

const PROFILES = [
  { userId: 1, name: "Alex", color: "#E50914" },
  { userId: 2, name: "Jamie", color: "#0071EB" },
  { userId: 3, name: "Taylor", color: "#46D369" },
  { userId: 4, name: "Morgan", color: "#E87C03" },
  { userId: 5, name: "Casey", color: "#B9090B" },
  { userId: 1000, name: "Guest (New)", color: "#555555" },
];

const ALL_GENRES = [
  "Action", "Adventure", "Animation", "Children's", "Comedy", "Crime",
  "Documentary", "Drama", "Fantasy", "Film-Noir", "Horror", "Musical",
  "Mystery", "Romance", "Sci-Fi", "Thriller", "War", "Western", "unknown",
];

function ProfilesPage() {
  const navigate = useNavigate();
  const { setSelectedUser, newProfile } = useApp();
  
  // Create a dynamic profiles list
  const displayProfiles = PROFILES.map(p => {
    // If we have a new profile and this is the guest slot, replace it
    if (newProfile && p.userId === 1000) {
      return { userId: newProfile.id, name: newProfile.name, color: newProfile.color };
    }
    return p;
  });

  // Genre picker state
  const [pendingUser, setPendingUser] = useState<{ id: number; name: string } | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<Set<string>>(new Set());

  const handleSelect = (userId: number, name: string) => {
    const storageKey = `genre_prefs_${userId}`;
    const savedPrefs = localStorage.getItem(storageKey);

    // Skip onboarding if:
    // 1. User is an existing user in the dataset (ID 1-943)
    // 2. OR they already completed onboarding (prefs in localStorage)
    if (userId <= 943 || savedPrefs) {
      setSelectedUser(userId, name);
      navigate({ to: "/dashboard" });
    } else {
      // Truly new user — show genre picker
      setPendingUser({ id: userId, name });
      setSelectedGenres(new Set());
    }
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) => {
      const next = new Set(prev);
      if (next.has(genre)) {
        next.delete(genre);
      } else {
        next.add(genre);
      }
      return next;
    });
  };

  const confirmGenres = () => {
    if (!pendingUser || selectedGenres.size < 3) return;
    const storageKey = `genre_prefs_${pendingUser.id}`;
    localStorage.setItem(storageKey, JSON.stringify(Array.from(selectedGenres)));
    setSelectedUser(pendingUser.id, pendingUser.name);
    navigate({ to: "/dashboard" });
  };

  const cancelGenrePicker = () => {
    setPendingUser(null);
    setSelectedGenres(new Set());
  };

  // ── Genre picker view ──────────────────────────────────────────
  if (pendingUser) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          What do you like, {pendingUser.name}?
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Pick at least <span className="text-primary font-semibold">3 genres</span> so we can
          personalize your experience.
        </p>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-w-2xl mb-8">
          {ALL_GENRES.map((genre) => {
            const isSelected = selectedGenres.has(genre);
            return (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={`px-4 py-2.5 rounded-md text-sm font-medium transition-all border ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                    : "bg-secondary text-secondary-foreground border-border hover:border-muted-foreground/50"
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={cancelGenrePicker}
            className="px-5 py-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back
          </button>
          <button
            onClick={confirmGenres}
            disabled={selectedGenres.size < 3}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-2.5 rounded-md text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue ({selectedGenres.size}/3 min)
          </button>
        </div>
      </div>
    );
  }

  // ── Profile picker view (default) ─────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl md:text-4xl font-medium text-foreground mb-10">
        Who's watching?
      </h1>
      <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
        {displayProfiles.map((p) => (
          <ProfileCard
            key={p.userId}
            userId={p.userId}
            name={p.name}
            color={p.color}
            onClick={() => handleSelect(p.userId, p.name)}
          />
        ))}
      </div>
    </div>
  );
}
