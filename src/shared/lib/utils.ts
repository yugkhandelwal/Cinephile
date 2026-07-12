import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSeoUrl(type: 'movie' | 'tv', id: number | string, title?: string): string {
  if (!title) return `/${type}/${id}`;
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  return `/${type}/${id}-${slug}`;
}
