import { useState, useEffect } from "react";
import { apiClient } from "../services/api";

interface Avatar {
  name: string;
  character?: string;
  profile_url: string;
  profile_path: string;
  id?: number;
  movie?: string;
  category?: string;
}

interface AvatarSelectorProps {
  onSelect: (avatarUrl: string) => void;
  onCancel: () => void;
}

export function AvatarSelector({ onSelect, onCancel }: AvatarSelectorProps) {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all available avatars (curated + popular + animated)
        const response = await apiClient.get("/avatars/all");
        
        if (response.data.avatars && response.data.avatars.length > 0) {
          setAvatars(response.data.avatars);
        } else {
          // Fallback to curated
          const curatedResponse = await apiClient.get("/avatars/curated");
          setAvatars(curatedResponse.data.avatars || []);
        }
      } catch (err) {
        console.error("Failed to load avatars:", err);
        setError("Could not load avatar options. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAvatars();
  }, []);

  const filteredAvatars = avatars.filter((avatar) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      avatar.name.toLowerCase().includes(searchLower) ||
      avatar.character?.toLowerCase().includes(searchLower) ||
      avatar.movie?.toLowerCase().includes(searchLower)
    );
  });

  const handleSelect = () => {
    if (selectedAvatar) {
      onSelect(selectedAvatar);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-background p-6 rounded-lg text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading avatars...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-foreground mb-2">Choose Your Avatar</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {error ? error : `Select from ${avatars.length} characters and actors`}
          </p>
          
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search by name, character, or movie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-secondary text-foreground placeholder-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Avatar Grid */}
        <div className="p-6">
          {filteredAvatars.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 mb-6">
              {filteredAvatars.map((avatar, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedAvatar(avatar.profile_url)}
                  className={`relative group overflow-hidden rounded-lg transition-all aspect-square ${
                    selectedAvatar === avatar.profile_url
                      ? "ring-3 ring-primary scale-110"
                      : "hover:scale-110 ring-1 ring-border hover:ring-primary"
                  }`}
                  title={`${avatar.character || avatar.name}${avatar.movie ? ` - ${avatar.movie}` : ""}`}
                >
                  {/* Image */}
                  <img
                    src={avatar.profile_url}
                    alt={avatar.character || avatar.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/200x300?text=Avatar";
                    }}
                  />

                  {/* Overlay Info */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2">
                    <p className="text-xs font-semibold text-white text-center line-clamp-2">
                      {avatar.character || avatar.name}
                    </p>
                    {avatar.movie && (
                      <p className="text-xs text-gray-300 text-center line-clamp-1 mt-1">
                        {avatar.movie}
                      </p>
                    )}
                  </div>

                  {/* Selection Checkmark */}
                  {selectedAvatar === avatar.profile_url && (
                    <div className="absolute top-1 right-1 bg-primary rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                      <svg
                        className="w-4 h-4 text-primary-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "No avatars match your search" : "No avatars available"}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-primary hover:underline text-sm"
                >
                  Clear search
                </button>
              )}
              {!searchTerm && (
                <p className="text-xs text-muted-foreground">
                  Make sure your backend is running and TMDB API is configured.
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end border-t border-border pt-6">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-md border border-border hover:bg-accent transition-colors text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={handleSelect}
              disabled={!selectedAvatar}
              className="px-4 py-2 rounded-md bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-primary-foreground font-medium"
            >
              Select Avatar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
