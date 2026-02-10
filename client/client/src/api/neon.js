const NEON_URL = import.meta.env.VITE_NEON_URL;
const NEON_KEY = import.meta.env.VITE_NEON_KEY;

export async function neonFetch(endpoint, options = {}) {
  const res = await fetch(`${NEON_URL}/${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      apikey: NEON_KEY,
      Authorization: `Bearer ${NEON_KEY}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }

  return res.json();
}
