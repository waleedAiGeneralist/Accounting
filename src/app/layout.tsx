import type { Metadata, Viewport } from "next";
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
  appleWebApp: {
    capable: true,
    title: "Hisab Kitab",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef3f1" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1714" },
  ],
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
      <body className="flex min-h-full flex-col antialiased">
        <PreferencesProvider>
          <div className="page-shell flex min-h-full flex-1 flex-col">
            <Nav />
            <main className="page-main">{children}</main>
            <footer className="no-print border-t border-[var(--border)] px-[var(--page-pad-x)] py-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-center text-xs text-[var(--muted)]">
              <Tx k="appName" /> · secured · v1
            </footer>
          </div>
        </PreferencesProvider>
      </body>
    </html>
  );
}
