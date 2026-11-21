export const maskEmail = (email: string) =>
  email.replace(/^(.).*(@.*)$/, "$1***$2");
