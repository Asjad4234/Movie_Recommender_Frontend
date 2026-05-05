import { Link } from "@tanstack/react-router";
import { useApp } from "../context/AppContext";

interface NavbarProps {
  avatarUrl?: string | null;
  onAvatarClick?: () => void;
}

export function Navbar({ avatarUrl, onAvatarClick }: NavbarProps) {
  const { selectedUserName } = useApp();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-background via-background/80 to-transparent">
      <div className="flex items-center justify-between px-4 md:px-12 py-4">
        <Link to="/" className="flex items-center gap-1">
          <span className="text-primary text-2xl md:text-3xl font-black tracking-tighter">
            MOVIEFLIX
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {selectedUserName ? (
            <>
              <Link
                to="/profiles"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Switch Profile
              </Link>
              <button
                onClick={onAvatarClick}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity group"
                title="Change avatar"
              >
                <div className="w-8 h-8 rounded bg-primary flex items-center justify-center shadow-lg shadow-primary/20 overflow-hidden">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={selectedUserName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="text-primary-foreground text-sm font-bold">
                      {selectedUserName[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-sm text-foreground font-medium hidden md:block group-hover:text-primary transition-colors">
                  {selectedUserName}
                </span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/profiles"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Existing Profiles
              </Link>
              <button
                onClick={() => {
                  // This will be handled by dashboard state
                  window.dispatchEvent(new CustomEvent("trigger-profile-setup"));
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-1.5 rounded text-sm font-semibold transition-all shadow-lg shadow-primary/20"
              >
                Set up Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
