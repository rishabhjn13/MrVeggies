import { useState, useCallback } from "react";

export function usePasswordToggle() {
  const [visible, setVisible] = useState(false);
  const toggle = useCallback(() => setVisible((v) => !v), []);
  const inputType = visible ? "text" : "password";
  return { visible, toggle, inputType } as const;
}
