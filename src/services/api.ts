const API_BASE = "http://localhost:5000";

export interface Movie {
  title: string;
  rating?: number;
  genres?: string;
  poster_url?: string | null;
  similarity_score?: number;
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
