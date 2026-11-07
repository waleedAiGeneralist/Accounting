"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  formatEntry,
  t as tKey,
  type DictEntry,
  type LabelKey,
  type ThemeMode,
  type LangMode,
} from "@/lib/labels";

const LANG_KEY = "hk-lang";
const THEME_KEY = "hk-theme";

type Prefs = {
  lang: LangMode;
  theme: ThemeMode;
  setLang: (lang: LangMode) => void;
  setTheme: (theme: ThemeMode) => void;
  t: (key: LabelKey) => string;
  tx: (entry: DictEntry) => string;
};

const PrefsContext = createContext<Prefs | null>(null);

function applyDom(lang: LangMode, theme: ThemeMode) {
  const root = document.documentElement;
  root.dataset.lang = lang;
  root.lang = lang === "ur" ? "ur" : "en";
  root.dir = lang === "ur" ? "rtl" : "ltr";
  root.classList.toggle("dark", theme === "dark");
  root.dataset.theme = theme;
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangMode>("en");
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedLang = localStorage.getItem(LANG_KEY) as LangMode | null;
    const storedTheme = localStorage.getItem(THEME_KEY) as ThemeMode | null;
    const nextLang: LangMode =
      storedLang === "en" || storedLang === "ur" || storedLang === "both"
        ? storedLang
        : "en";
    const nextTheme: ThemeMode = storedTheme === "dark" ? "dark" : "light";
    setLangState(nextLang);
    setThemeState(nextTheme);
    applyDom(nextLang, nextTheme);
    setReady(true);
  }, []);

  const setLang = useCallback((next: LangMode) => {
    setLangState(next);
    localStorage.setItem(LANG_KEY, next);
    applyDom(next, (localStorage.getItem(THEME_KEY) as ThemeMode) || "light");
  }, []);

  const setTheme = useCallback((next: ThemeMode) => {
    setThemeState(next);
    localStorage.setItem(THEME_KEY, next);
    const langNow =
      (localStorage.getItem(LANG_KEY) as LangMode) || "en";
    applyDom(langNow, next);
  }, []);

  // Keep DOM in sync when either changes together
  useEffect(() => {
    if (!ready) return;
    applyDom(lang, theme);
  }, [lang, theme, ready]);

  const value = useMemo<Prefs>(
    () => ({
      lang,
      theme,
      setLang,
      setTheme,
      t: (key) => tKey(key, lang),
      tx: (entry) => formatEntry(entry, lang),
    }),
    [lang, theme, setLang, setTheme]
  );

  return (
    <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>
  );
}

export function usePrefs(): Prefs {
  const ctx = useContext(PrefsContext);
  if (!ctx) {
    throw new Error("usePrefs must be used within PreferencesProvider");
  }
  return ctx;
}

/** String translator for the active language. */
export function useT() {
  return usePrefs().t;
}
