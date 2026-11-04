import { useEffect, useState } from "react";

const storageKey = "avinext-theme";
const getInitialTheme = () => {
  const saved = localStorage.getItem(storageKey);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    localStorage.setItem(storageKey, next);
    setTheme(next);
  };
  const dark = theme === "dark";
  return <button type="button" className="theme-toggle" onClick={toggle}
    aria-label={dark ? "Activar tema claro" : "Activar tema oscuro"}
    title={dark ? "Tema claro" : "Tema oscuro"}><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={dark ? "M12 4V2m0 20v-2m8-8h2M2 12h2m13.7-5.7 1.4-1.4M4.9 19.1l1.4-1.4m0-11.4L4.9 4.9m14.2 14.2-1.4-1.4M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" : "M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10Z"}/></svg></button>;
}
