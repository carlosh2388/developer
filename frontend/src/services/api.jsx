import { API_URL } from "../config";

export async function api(path, options = {}) {
  const token = localStorage.getItem("avinext_token");
  const certificate = localStorage.getItem("avinext_license_certificate");
  const response = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(certificate ? { "X-License-Certificate": certificate } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "No fue posible completar la solicitud.");
    error.code = data.code;
    error.status = response.status;
    throw error;
  }
  return data;
}
