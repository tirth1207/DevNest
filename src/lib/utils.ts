import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getMainUrl(): string {
  return process.env.NEXT_PUBLIC_MAIN_URL || "https://dev-nest-6t4w.vercel.app"
}

export function getBaseUrl() {
  if (typeof window !== "undefined") {
    return ""
  }
  return getMainUrl()
}
