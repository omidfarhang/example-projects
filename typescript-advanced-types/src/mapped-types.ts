/** Mapped types — transform properties of an existing type. */

export type ReadonlyDeep<T> = {
  readonly [K in keyof T]: T[K] extends object ? ReadonlyDeep<T[K]> : T[K];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

export type Stringify<T> = {
  [K in keyof T]: string;
};

export interface UserProfile {
  readonly id: number;
  name: string;
  email: string;
}

export type ReadonlyUser = ReadonlyDeep<UserProfile>;
export type UserWithoutEmail = Optional<UserProfile, 'email'>;
