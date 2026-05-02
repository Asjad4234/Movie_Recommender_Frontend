import { createContext, useContext, useState, type ReactNode } from "react";
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
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState("");
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

  const setSelectedUser = (id: number, name: string) => {
    setSelectedUserId(id);
    setSelectedUserName(name);
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
