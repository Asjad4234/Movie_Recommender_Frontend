import { Link } from "@tanstack/react-router";
import { useApp } from "../context/AppContext";

export function Navbar() {
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
          {selectedUserName && (
            <>
              <Link
                to="/profiles"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Switch Profile
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground text-sm font-bold">
                    {selectedUserName[0]}
                  </span>
                </div>
                <span className="text-sm text-foreground hidden md:block">
                  {selectedUserName}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
