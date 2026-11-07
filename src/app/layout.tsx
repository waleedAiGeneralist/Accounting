import type { Metadata } from "next";
import { Fraunces, Source_Sans_3, Noto_Naskh_Arabic } from "next/font/google";
import { Nav } from "@/components/layout/Nav";
import { L } from "@/lib/labels";
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
  title: `${L.appName} — Rice & Kiryana`,
  description: "Double-entry accounting for Pakistani rice & kiryana shops",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${urdu.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased">
        <div className="page-shell flex min-h-full flex-1 flex-col">
          <Nav />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
          <footer className="no-print border-t border-[var(--border)] py-4 text-center text-xs text-[var(--muted)]">
            {L.appName} · local-first · v1
          </footer>
        </div>
      </body>
    </html>
  );
}
