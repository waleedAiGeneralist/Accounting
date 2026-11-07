import type { Metadata } from "next";
import { Fraunces, Source_Sans_3, Noto_Naskh_Arabic } from "next/font/google";
import { Nav } from "@/components/layout/Nav";
import { PreferencesProvider } from "@/components/prefs/PreferencesProvider";
import { Tx } from "@/components/i18n/Tx";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const urdu = Noto_Naskh_Arabic({
  variable: "--font-urdu",
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Hisab Kitab — Rice & Kiryana",
  description: "Double-entry accounting for Pakistani rice & kiryana shops",
};

/** Prevent theme/lang flash before React hydrates. */
const bootScript = `
(function(){
  try {
    var lang = localStorage.getItem('hk-lang') || 'en';
    var theme = localStorage.getItem('hk-theme') || 'light';
    var r = document.documentElement;
    if (lang !== 'en' && lang !== 'ur' && lang !== 'both') lang = 'en';
    if (theme !== 'dark') theme = 'light';
    r.dataset.lang = lang;
    r.dataset.theme = theme;
    r.lang = lang === 'ur' ? 'ur' : 'en';
    r.dir = lang === 'ur' ? 'rtl' : 'ltr';
    r.classList.toggle('dark', theme === 'dark');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-lang="en"
      data-theme="light"
      className={`${display.variable} ${body.variable} ${urdu.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <PreferencesProvider>
          <div className="page-shell flex min-h-full flex-1 flex-col">
            <Nav />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
            <footer className="no-print border-t border-[var(--border)] py-4 text-center text-xs text-[var(--muted)]">
              <Tx k="appName" /> · <Tx k="localFirst" /> · v1
            </footer>
          </div>
        </PreferencesProvider>
      </body>
    </html>
  );
}
