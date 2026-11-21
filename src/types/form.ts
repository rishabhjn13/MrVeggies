/** Error message per field for a form whose values look like `T`. */
export type FieldErrors<T> = Partial<Record<keyof T, string>>;

/** Which fields the user has interacted with. */
export type FieldTouched<T> = Partial<Record<keyof T, boolean>>;

