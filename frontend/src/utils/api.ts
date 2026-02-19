/**
 * Central API URL configuration.
 * In production, VITE_API_URL must be set to the deployed backend URL.
 * In development, falls back to http://localhost:3000.
 */
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Resolves an image URL so it works both in development and production.
 * 
 * - Cloudinary URLs (https://res.cloudinary.com/...) are returned as-is
 * - Relative paths like `/uploads/image.jpg` are prefixed with the backend API URL
 * - Full URLs (http/https) are returned as-is
 * - Empty/falsy values return the fallback
 */
export function getImageUrl(url: string | undefined | null, fallback: string = ''): string {
  if (!url) return fallback;
  
  // Already a full URL (Cloudinary or other CDN)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Relative path like /uploads/image.jpg — prepend backend URL
  if (url.startsWith('/')) {
    return `${API_URL}${url}`;
  }
  
  return url || fallback;
}
