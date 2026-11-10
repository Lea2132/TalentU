export const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/+$/, "");

export const API_URL = `${API_ORIGIN}/api`;

export const apiAssetUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  return `${API_ORIGIN}/${path.replace(/^[\\/]+/, "").replace(/\\/g, "/")}`;
};
