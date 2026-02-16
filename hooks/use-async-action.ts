"use client";

import { useState, useCallback } from "react";

interface UseAsyncActionOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

/**
 * Custom hook for handling async actions with loading and error states
 * @param asyncFn - Async function to execute
 * @param options - Options for success/error handling
 * @returns Object with execute function, loading state, and error
 */
export function useAsyncAction<T, Args extends unknown[]>(
  asyncFn: (...args: Args) => Promise<T>,
  options?: UseAsyncActionOptions<T>,
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: Args) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await asyncFn(...args);
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("An error occurred");
        setError(error);
        options?.onError?.(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [asyncFn, options],
  );

  return { execute, isLoading, error };
}
