import { zodResolver as originalZodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { FieldValues, Resolver } from "react-hook-form";

/**
 * A strictly-typed wrapper around react-hook-form's zodResolver.
 * It resolves type conflicts arising from mismatched internal ZodType signatures
 * across different installed library versions.
 */
export function zodResolver<T extends FieldValues>(
  schema: z.ZodType<any, any, any>,
): Resolver<T> {
  return originalZodResolver(schema as any);
}
