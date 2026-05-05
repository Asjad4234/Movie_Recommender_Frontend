import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import type { Movie } from "../services/api";

interface AppState {
  selectedUserId: number | null;
  selectedUserName: string;
  searchQuery: string;
  recommendations: Movie[];
  hybridRecommendations: Movie[];
  popularMovies: Movie[];
  isLoading: boolean;
  isHybridLoading: boolean;
  isPopularLoading: boolean;
  topN: number;
  itemWeight: number;
  userWeight: number;
  newProfile: { id: number; name: string; color: string } | null;
  myList: Movie[];
}

interface AppContextValue extends AppState {
  setSelectedUser: (id: number, name: string) => void;
  setSearchQuery: (q: string) => void;
  setRecommendations: (m: Movie[]) => void;
  setHybridRecommendations: (m: Movie[]) => void;
  setPopularMovies: (m: Movie[]) => void;
  setIsLoading: (v: boolean) => void;
  setIsHybridLoading: (v: boolean) => void;
  setIsPopularLoading: (v: boolean) => void;
  setTopN: (n: number) => void;
  setItemWeight: (w: number) => void;
  setUserWeight: (w: number) => void;
  setNewProfile: (p: { id: number; name: string; color: string } | null) => void;
  setMyList: (m: Movie[]) => void;
  addToMyList: (m: Movie) => void;
  removeFromMyList: (title: string) => void;
  toggleMyList: (m: Movie) => void;
  isInMyList: (title: string) => boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem("selectedUserId");
    return saved ? Number(saved) : null;
  });
  const [selectedUserName, setSelectedUserName] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("selectedUserName") || "";
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [hybridRecommendations, setHybridRecommendations] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHybridLoading, setIsHybridLoading] = useState(false);
  const [isPopularLoading, setIsPopularLoading] = useState(false);
  const [topN, setTopN] = useState(10);
  const [itemWeight, setItemWeight] = useState(0.5);
  const [userWeight, setUserWeight] = useState(0.5);
  const [newProfile, setNewProfile] = useState<{ id: number; name: string; color: string } | null>(null);
  const [myList, setMyList] = useState<Movie[]>([]);

  const storageKey = useMemo(
    () => (selectedUserId ? `myList_${selectedUserId}` : 'myList_guest'),
    [selectedUserId]
  );

  // Load My List whenever the user changes
  useEffect(() => {
    const loadMyList = async () => {
      const stored = localStorage.getItem(storageKey);
      let initialList: Movie[] = [];
      
      if (stored) {
        try {
          initialList = JSON.parse(stored);
        } catch (e) {
          console.error("Failed to parse myList", e);
        }
      }

      // Pre-load for existing users if local is empty
      if (initialList.length === 0 && selectedUserId && selectedUserId <= 943) {
        try {
          const { getUserSavedMovies } = await import("../services/api");
          const backendMovies = await getUserSavedMovies(selectedUserId);
          initialList = backendMovies;
          localStorage.setItem(storageKey, JSON.stringify(initialList));
        } catch (e) {
          console.error("Failed to fetch saved movies", e);
        }
      }
      setMyList(initialList);
    };
    loadMyList();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId]); // storageKey is memoized from selectedUserId — no need to duplicate

  const addToMyList = useCallback((movie: Movie) => {
    setMyList(prev => {
      if (prev.some(m => m.title === movie.title)) return prev;
      const next = [...prev, movie];
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }, [storageKey]);

  const removeFromMyList = useCallback((title: string) => {
    setMyList(prev => {
      const next = prev.filter(m => m.title !== title);
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }, [storageKey]);

  const toggleMyList = useCallback((movie: Movie) => {
    setMyList(prev => {
      const exists = prev.some(m => m.title === movie.title);
      const next = exists
        ? prev.filter(m => m.title !== movie.title)
        : [...prev, movie];
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }, [storageKey]);

  const isInMyList = useCallback((title: string) => myList.some(m => m.title === title), [myList]);

  const setSelectedUser = (id: number, name: string) => {
    setSelectedUserId(id);
    setSelectedUserName(name);
    localStorage.setItem("selectedUserId", id.toString());
    localStorage.setItem("selectedUserName", name);
  };

  return (
    <AppContext.Provider
      value={{
        selectedUserId,
        selectedUserName,
        searchQuery,
        recommendations,
        hybridRecommendations,
        popularMovies,
        isLoading,
        isHybridLoading,
        isPopularLoading,
        topN,
        itemWeight,
        userWeight,
        setSelectedUser,
        setSearchQuery,
        setRecommendations,
        setHybridRecommendations,
        setPopularMovies,
        setIsLoading,
        setIsHybridLoading,
        setIsPopularLoading,
        setTopN,
        setItemWeight,
        setUserWeight,
        newProfile,
        setNewProfile,
        myList,
        setMyList,
        addToMyList,
        removeFromMyList,
        toggleMyList,
        isInMyList,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
