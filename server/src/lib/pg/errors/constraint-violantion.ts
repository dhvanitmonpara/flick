import { DatabaseError } from "pg";

export function isConstraintViolation(error: unknown): boolean {
  if (!error) return false;

  // Native pg driver error
  if (error instanceof DatabaseError) {
    return (
      error.code === "23505" || // unique_violation
      error.code === "23514" || // check_violation
      error.code === "23503" || // foreign_key_violation
      error.code === "23502"    // not_null_violation
    );
  }

  // Some ORMs wrap errors
  if (typeof error === "object" && error !== null) {
    const code = (error as any).code;
    return (
      code === "23505" ||
      code === "23514" ||
      code === "23503" ||
      code === "23502"
    );
  }

  return false;
}