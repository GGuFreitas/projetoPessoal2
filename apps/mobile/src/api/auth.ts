import type { AuthResponseBody, LoginInput, RegisterInput, UpdateMeInput } from "@organizalar/contracts";
import { apiFetch } from "./client.js";

export function register(input: RegisterInput) {
  return apiFetch<AuthResponseBody>("/auth/register", { method: "POST", body: input, auth: false });
}

export function login(input: LoginInput) {
  return apiFetch<AuthResponseBody>("/auth/login", { method: "POST", body: input, auth: false });
}

export function getMe() {
  return apiFetch<AuthResponseBody["user"]>("/auth/me");
}

export function updateMe(input: UpdateMeInput) {
  return apiFetch<AuthResponseBody["user"]>("/auth/me", { method: "PATCH", body: input });
}
