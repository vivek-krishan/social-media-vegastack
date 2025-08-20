"use client";
import { useEffect, useRef } from "react";

export const useDebounce = <
  T extends (...args: Parameters<T>) => ReturnType<T>,
>(
  callback: T,
  delay: number
) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current); // Cleanup timeout on unmount
      }
    };
  }, []);

  return (...args: Parameters<T>): void => {
    if (timerRef.current) {
      clearTimeout(timerRef.current); // Reset timer on new call
    }
    timerRef.current = setTimeout(() => {
      callback(...args); // Execute callback after delay
    }, delay);
  };
};
