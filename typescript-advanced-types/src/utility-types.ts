/** Utility-style type transformations inspired by built-in TS utilities. */

export type PickByType<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K];
};

export type OmitByType<T, V> = {
  [K in keyof T as T[K] extends V ? never : K]: T[K];
};

export type NonNullableFields<T> = {
  [K in keyof T]: NonNullable<T[K]>;
};

export interface ApiResponse {
  id: number;
  name: string;
  deletedAt: string | null;
  score: number | undefined;
}

export type RequiredResponse = NonNullableFields<ApiResponse>;
export type StringFields = PickByType<ApiResponse, string>;
export type NonStringFields = OmitByType<ApiResponse, string>;
