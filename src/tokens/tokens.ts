export const colors = {
  brand: "#00A877",
  brandDark: "#007A57",
  brandLight: "#E6F7F2",
  accent: "#FF6B35",
  accentLight: "#FFF3EE",
  accentText: "#CC4A1A",

  bg: "#FAFAF7",
  surface: "#FFFFFF",
  text: "#1A1A18",
  muted: "#6B6B66",
  subtle: "#9B9B96",  
  border: "rgba(0,0,0,0.08)",
  borderFocus: "#00A877",

  error: "#D93025",
  errorLight: "#FEF0EF",
  success: "#00A877",
  successLight: "#E6F7F2",
  warning: "#E8820C",
  warningLight: "#FFF3E0",
} as const;

export const typography = {
  fontDisplay: "'Bricolage Grotesque', sans-serif",
  fontBody: "'DM Sans', sans-serif",

  sizeXs: "11px",
  sizeSm: "12px",
  sizeBase: "14px",
  sizeMd: "15px",
  sizeLg: "18px",
  sizeXl: "24px",
  size2xl: "32px",

  weightRegular: 400,
  weightMedium: 500,
  weightBold: 700,
  weightBlack: 800,
} as const;

export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "40px",
  "2xl": "64px",
} as const;

export const radii = {
  xs: "8px",
  sm: "10px",
  md: "16px",
  lg: "24px",
  pill: "999px",
} as const;

export const shadows = {
  card: "0 2px 24px rgba(0,0,0,0.07)",
  btn: "0 4px 20px rgba(0,168,119,0.32)",
  input: "0 0 0 3px rgba(0,168,119,0.12)",
  float: "0 4px 20px rgba(0,0,0,0.10)",
} as const;
