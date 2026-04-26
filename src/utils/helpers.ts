// ─────────────────────────────────────────────
//  Zapp Utility Helpers
// ─────────────────────────────────────────────

/** Joins class names, filtering out falsy values */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Format a number as Indian Rupee price */
export function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/** Calculate discount percentage between original and sale price */
export function discountPercent(original: number, sale: number): number {
  return Math.round(((original - sale) / original) * 100);
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Pluralize a word based on count */
export function pluralize(
  count: number,
  singular: string,
  plural?: string,
): string {
  if (count === 1) return `${count} ${singular}`;
  return `${count} ${plural ?? singular + "s"}`;
}

/** Truncate a string to a max length with ellipsis */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + "…";
}

/** Format a delivery time estimate */
export function formatDeliveryTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

/** Generate initials from a full name (e.g. "Rahul Sharma" → "RS") */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** Validate Indian phone number */
export function isValidPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.replace(/\s/g, ""));
}

/** Password strength: 0 = empty, 1 = weak, 2 = fair, 3 = strong */
export function getPasswordStrength(password: string): 0 | 1 | 2 | 3 {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  return score as 0 | 1 | 2 | 3;
}

export const PASSWORD_STRENGTH_LABEL: Record<0 | 1 | 2 | 3, string> = {
  0: "",
  1: "Weak",
  2: "Fair",
  3: "Strong",
};

export const PASSWORD_STRENGTH_COLOR: Record<0 | 1 | 2 | 3, string> = {
  0: "transparent",
  1: "#E8820C",
  2: "#F5C842",
  3: "#00A877",
};

/** Mask email for display: r***@gmail.com */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  return `${local[0]}${"*".repeat(Math.max(local.length - 1, 2))}@${domain}`;
}

/** Simple sleep for async UX flows */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
