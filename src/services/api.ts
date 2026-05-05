const API_BASE = "http://localhost:5000";

export interface Movie {
  title: string;
  rating?: number;
  genres?: string;
  poster_url?: string | null;
  similarity_score?: number;
  reason?: string;
  source?: string;
  overview?: string;
  [key: string]: unknown;
}

export interface RecommendRequest {
  title: string;
  top_n: number;
}

export interface HybridRecommendRequest {
  user_id: number;
  title: string;
  top_n: number;
  item_weight: number;
  user_weight: number;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || error.message || `Request failed (${res.status})`);
  }
  return res.json();
}

// Generic API client
export const apiClient = {
  async get<T>(endpoint: string): Promise<{ data: T }> {
    const res = await fetch(`${API_BASE}${endpoint}`);
    const data = await handleResponse<T>(res);
    return { data };
  },
  async post<T>(endpoint: string, body?: unknown): Promise<{ data: T }> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await handleResponse<T>(res);
    return { data };
  },
};

export async function getMovies(): Promise<Movie[]> {
  const res = await fetch(`${API_BASE}/movies`);
  return handleResponse<Movie[]>(res);
}

export async function getUsers(): Promise<unknown[]> {
  const res = await fetch(`${API_BASE}/users`);
  return handleResponse<unknown[]>(res);
}

export async function getRecommendations(data: RecommendRequest): Promise<Movie[]> {
  const res = await fetch(`${API_BASE}/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await handleResponse<any>(res);
  if (Array.isArray(result)) return result;
  if (result && Array.isArray(result.recommendations)) return result.recommendations;
  throw new Error('Unexpected response shape from /recommend');
}

export async function getHybridRecommendations(data: HybridRecommendRequest): Promise<Movie[]> {
  const res = await fetch(`${API_BASE}/recommend-hybrid`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await handleResponse<any>(res);
  if (Array.isArray(result)) return result;
  if (result && Array.isArray(result.recommendations)) return result.recommendations;
  throw new Error('Unexpected response shape from /recommend-hybrid');
}

export async function getRecommendationsFromMyList(mylist: string[], count: number = 10): Promise<Movie[]> {
  const res = await fetch(`${API_BASE}/recommend-from-mylist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mylist, count }),
  });
  const result = await handleResponse<any>(res);
  if (result && Array.isArray(result.recommendations)) return result.recommendations;
  throw new Error('Unexpected response shape from /recommend-from-mylist');
}

export async function getPopularMovies(): Promise<Movie[]> {
  const res = await fetch(`${API_BASE}/popular`);
  return handleResponse<Movie[]>(res);
}

export async function getRecommendationsByGenres(genres: string[], top_n: number = 20): Promise<Movie[]> {
  const res = await fetch(`${API_BASE}/recommend-by-genres`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ genres, top_n }),
  });
  const result = await handleResponse<any>(res);
  if (Array.isArray(result)) return result;
  if (result && Array.isArray(result.recommendations)) return result.recommendations;
  throw new Error('Unexpected response shape from /recommend-by-genres');
}

export async function getUserSavedMovies(userId: number): Promise<Movie[]> {
  const res = await fetch(`${API_BASE}/user-saved-movies/${userId}`);
  return handleResponse<Movie[]>(res);
}

export async function searchMovies(query: string): Promise<Movie[]> {
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
  return handleResponse<Movie[]>(res);
}
