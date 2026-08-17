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
    title={dark ? "Tema claro" : "Tema oscuro"}><span aria-hidden="true">{dark ? "☀" : "☾"}</span></button>;
}
