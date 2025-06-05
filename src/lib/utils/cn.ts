// src/lib/utils/cn.ts

/**
 * Utility function to concatenate class names
 * Simple alternative to clsx/cn for class name handling
 */
export function cn(
  ...classes: (string | boolean | undefined | null)[]
): string {
  return classes.filter(Boolean).join(" ");
}
