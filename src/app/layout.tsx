import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { inter, spaceGrotesk } from "@/styles/fonts";

import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Mehdi Bouchard — Portfolio",
    template: "%s — Mehdi Bouchard",
  },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider>
          <a className="skip-link" href="#main-content">
            Aller au contenu
          </a>
          <SiteHeader />
          {children}
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
