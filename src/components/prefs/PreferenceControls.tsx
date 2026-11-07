"use client";

import { usePrefs } from "./PreferencesProvider";
import { Tx } from "@/components/i18n/Tx";
import type { LangMode, ThemeMode } from "@/lib/labels";

const LANGS: { id: LangMode; label: string }[] = [
  { id: "en", label: "English" },
  { id: "ur", label: "اردو" },
  { id: "both", label: "EN + اردو" },
];

const THEMES: { id: ThemeMode; labelEn: string; labelUr: string; icon: string }[] = [
  { id: "light", labelEn: "Light", labelUr: "برائیٹ", icon: "☀" },
  { id: "dark", labelEn: "Dark", labelUr: "ڈارک", icon: "☾" },
];

function SegButton({
  active,
  onClick,
  children,
  title,
  className = "",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`min-h-9 rounded-md px-2.5 py-1.5 text-xs font-semibold transition sm:min-h-8 ${
        active
          ? "bg-[var(--accent)] text-white shadow-sm"
          : "bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--fg)]"
      } ${className}`}
    >
      {children}
    </button>
  );
}

/** Compact controls for the top nav / mobile sheet. */
export function NavPreferenceControls({
  compact = true,
}: {
  compact?: boolean;
}) {
  const { lang, theme, setLang, setTheme } = usePrefs();

  return (
    <div
      className={`flex ${
        compact
          ? "flex-wrap items-center justify-end gap-1.5"
          : "w-full flex-col gap-3"
      }`}
    >
      <div
        className={`flex rounded-md border border-[var(--border)] p-0.5 ${
          compact ? "" : "w-full"
        }`}
        role="group"
        aria-label="Language"
      >
        {LANGS.map((l) => (
          <SegButton
            key={l.id}
            active={lang === l.id}
            onClick={() => setLang(l.id)}
            title={l.label}
            className={compact ? "" : "flex-1 py-2.5 text-sm"}
          >
            {l.id === "en" ? "EN" : l.id === "ur" ? "اردو" : "EN+UR"}
          </SegButton>
        ))}
      </div>
      <div
        className={`flex rounded-md border border-[var(--border)] p-0.5 ${
          compact ? "" : "w-full"
        }`}
        role="group"
        aria-label="Theme"
      >
        {THEMES.map((th) => (
          <SegButton
            key={th.id}
            active={theme === th.id}
            onClick={() => setTheme(th.id)}
            title={th.labelEn}
            className={compact ? "" : "flex-1 py-2.5 text-sm"}
          >
            {compact ? th.icon : `${th.icon} ${th.labelEn}`}
          </SegButton>
        ))}
      </div>
    </div>
  );
}

/** Full preference cards for Settings page. */
export function SettingsPreferences() {
  const { lang, theme, setLang, setTheme } = usePrefs();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="card-panel space-y-3">
        <div>
          <h2 className="font-display text-lg font-semibold">
            <Tx k="language" />
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            <Tx k="languageHint" />
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {LANGS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setLang(l.id)}
              className={`flex min-h-11 items-center justify-between rounded-md border px-3 py-2.5 text-left text-sm transition ${
                lang === l.id
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "border-[var(--border)] hover:bg-[var(--surface-2)]"
              }`}
            >
              <span className="font-semibold">{l.label}</span>
              {lang === l.id ? <span aria-hidden>✓</span> : null}
            </button>
          ))}
        </div>
      </div>

      <div className="card-panel space-y-3">
        <div>
          <h2 className="font-display text-lg font-semibold">
            <Tx k="theme" />
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            <Tx k="themeHint" />
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {THEMES.map((th) => (
            <button
              key={th.id}
              type="button"
              onClick={() => setTheme(th.id)}
              className={`flex min-h-11 items-center justify-between rounded-md border px-3 py-2.5 text-left text-sm transition ${
                theme === th.id
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "border-[var(--border)] hover:bg-[var(--surface-2)]"
              }`}
            >
              <span className="font-semibold">
                {th.icon} {th.labelEn}{" "}
                <span className="text-[var(--muted)]">({th.labelUr})</span>
              </span>
              {theme === th.id ? <span aria-hidden>✓</span> : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
