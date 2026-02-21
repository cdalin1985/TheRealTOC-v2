export function isNonNullish<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

export function getErrorMessage(error: unknown): string {
  if (isError(error)) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
}

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}