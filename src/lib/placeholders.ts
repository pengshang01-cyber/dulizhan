export function isTodo(value: unknown): value is `TODO_${string}` {
  return typeof value === "string" && value.startsWith("TODO_");
}

export function display<T extends string | number>(
  value: T,
  label: string,
): T | `[TODO: ${string}]` {
  return isTodo(value) ? `[TODO: ${label}]` : value;
}
