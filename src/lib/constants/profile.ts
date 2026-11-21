export const BIO_LIMIT = 160;

export const DEFAULT_AVATAR_URL =
  "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

export const GENDER_OPTIONS = [
  { value: "", label: "Prefer not to say" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
] as const;

/** Derived from the options above, so the two can't drift apart. */
export type Gender = (typeof GENDER_OPTIONS)[number]["value"];
