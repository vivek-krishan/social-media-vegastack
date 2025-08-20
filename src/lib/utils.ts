import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Readable } from "stream";
import { NextRequest } from "next/server";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ReadableWithHeaders extends Readable {
  headers: Record<string, string>;
}

export function toNodeStream(req: NextRequest): ReadableWithHeaders {
  if (!req.body) {
    throw new Error("Request body is null");
  }

  const readable = Readable.fromWeb(req.body as ReadableStream<Uint8Array>);
  const readableWithHeaders = readable as ReadableWithHeaders;
  readableWithHeaders.headers = Object.fromEntries(req.headers.entries());

  return readableWithHeaders;
}

export function getWeeksSince(createdAt: string | Date): string {
  const createdDate = new Date(createdAt);

  if (isNaN(createdDate.getTime())) {
    console.error("Invalid createdAt value:", createdAt);
    return "Invalid date";
  }

  const now = new Date();
  const diffMs = now.getTime() - createdDate.getTime();

  // Calculate weeks
  const weeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
  if (weeks > 0) {
    return `${weeks}w`;
  }

  // Calculate hours
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours > 0) {
    return `${hours}h`;
  }

  // Calculate minutes
  const minutes = Math.floor(diffMs / (1000 * 60));
  return `${minutes}m`;
}


