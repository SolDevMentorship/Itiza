export async function fetchCurrentUser() {
  const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const resp = await fetch(`${VITE_API_URL}/Itiza_Delivery/auth/me`, {
    method: "GET",
    credentials: "include", // send cookie
  });

  if (!resp.ok) {
    return null;
  }
  const json = await resp.json();
  return json?.user ?? null;
}
