import { getToken } from "../auth/storage.js";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3333";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean; // default true
};

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["content-type"] = "application/json";
  if (auth) {
    const token = await getToken();
    if (token) headers.authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    const message = (payload && typeof payload === "object" && "message" in payload)
      ? String((payload as { message: unknown }).message)
      : `Erro ${res.status}`;
    throw new ApiError(res.status, message);
  }

  return payload as T;
}

export async function apiUpload<T>(path: string, file: { uri: string; name: string; mimeType: string }): Promise<T> {
  const token = await getToken();
  const form = new FormData();
  form.append("file", { uri: file.uri, name: file.name, type: file.mimeType } as unknown as Blob);

  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: token ? { authorization: `Bearer ${token}` } : undefined,
    body: form,
  });

  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const message = (payload && typeof payload === "object" && "message" in payload)
      ? String((payload as { message: unknown }).message)
      : `Erro ${res.status}`;
    throw new ApiError(res.status, message);
  }
  return payload as T;
}
