/** Conditional types — types that depend on a condition. */

export type IsString<T> = T extends string ? 'Yes' : 'No';

export function processValue<T>(value: T): T extends string ? string[] : T[] {
  if (typeof value === 'string') {
    return value.split('') as T extends string ? string[] : T[];
  }
  return [value] as T extends string ? string[] : T[];
}

export type TypeName<T> = T extends string
  ? 'string'
  : T extends number
    ? 'number'
    : T extends boolean
      ? 'boolean'
      : T extends undefined
        ? 'undefined'
        : T extends (...args: never[]) => unknown
          ? 'function'
          : 'object';

export function getTypeName<T>(value: T): TypeName<T> {
  if (typeof value === 'string') return 'string' as TypeName<T>;
  if (typeof value === 'number') return 'number' as TypeName<T>;
  if (typeof value === 'boolean') return 'boolean' as TypeName<T>;
  if (typeof value === 'undefined') return 'undefined' as TypeName<T>;
  if (typeof value === 'function') return 'function' as TypeName<T>;
  return 'object' as TypeName<T>;
}
