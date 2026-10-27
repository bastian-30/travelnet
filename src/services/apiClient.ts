import { auth } from "./firebase";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000").replace(/\/$/, "");

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function currentToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) {
    return null;
  }

  try {
    return await user.getIdToken();
  } catch {
    return null;
  }
}

interface RequestOptions extends RequestInit {
  authenticated?: boolean;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { authenticated = true, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers);
  const token = authenticated ? await currentToken() : null;

  if (fetchOptions.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...fetchOptions,
      headers,
    });
  } catch {
    throw new ApiError("No se pudo conectar con el servidor", 0);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(body?.error || `Error HTTP ${response.status}`, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
