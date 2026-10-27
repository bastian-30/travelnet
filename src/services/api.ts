const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000").replace(/\/$/, "");

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Error HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export interface Resena {
  id: number;
  autor: string;
  calificacion: number;
  comentario: string;
  destino_id: string;
  destino_nombre: string;
  departamento: string;
  creado_en: string;
}

export interface NuevaResena {
  autor: string;
  calificacion: number;
  comentario: string;
  destino_id?: string;
  destino_nombre: string;
  departamento: string;
}

export interface Destino {
  id: number;
  nombre: string;
  departamento: string;
  descripcion: string | null;
  imagen_url: string | null;
}

export function comprobarAPI() {
  return request<{ ok: boolean; database: string }>("/api/health");
}

export function obtenerResenas() {
  return request<Resena[]>("/api/resenas");
}

export function guardarResena(datos: NuevaResena) {
  return request<Resena>("/api/resenas", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export function obtenerDestinos() {
  return request<Destino[]>("/api/destinos");
}

export function guardarDestino(datos: Omit<Destino, "id">) {
  return request<Destino>("/api/destinos", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export function obtenerStreams(): Promise<unknown[]> {
  return request<unknown[]>("/api/streams");
}
