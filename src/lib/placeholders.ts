export function isTodo(value: unknown): value is `TODO_${string}` {
  return typeof value === "string" && value.startsWith("TODO_");
}

export function hasPlaceholder(value: string): boolean {
  return /\[TODO|TODO_|^TODO(?:-[\w-]+)?$/i.test(value);
}

export function confirmedText(value: unknown): string | undefined {
  if (typeof value !== "string" && typeof value !== "number") return;
  const text = String(value).trim();
  return text && !hasPlaceholder(text) ? text : undefined;
}

export function display<T extends string | number>(
  value: T,
  label: string,
): T | `[TODO: ${string}]` {
  return isTodo(value) ? `[TODO: ${label}]` : value;
}
