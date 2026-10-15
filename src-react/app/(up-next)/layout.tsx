import type { Metadata } from "next";
import { agdasima, montserrat } from "@/app/fonts";
import AnalyticsConsent from "@/src/components/analytics/AnalyticsConsent";
import CookiePreferencesButton from "@/src/components/analytics/CookiePreferencesButton";
// Vendor CSS is imported here rather than via Sass @import: Sass may prepend a BOM to
// its output, which makes Turbopack reject plain CSS @import rules.
import '@/public/aos/aos.css';
import '@/public/bootstrap-icons/bootstrap-icons.min.css';
import '@/public/galleria/themes/twelve/galleria.twelve.min.css';
import '@/app/(default)/global.scss';
import styles from '@/app/(up-next)/layout.module.css';

export const metadata: Metadata = {
  title: "Bitbash - Free two-day event covering the latest Microsoft technologies",
  description: "Get ready for an exciting two-day event that will cover the latest Microsoft technologies and innovations.",
  openGraph: {
    type: "website",
    locale: "en_US", 
    title: "Bitbash - Free two-day event covering the latest Microsoft technologies",
    description: "Get ready for an exciting two-day event that will cover the latest Microsoft technologies and innovations.",
    url: "https://www.bitbash.nl/",
    siteName: "Bitbash",
    images: [
      {
        url: "https://www.bitbash.nl/img/og-logo.png",
        width: 1200,
        height: 630,
        type: "image/png",
      },
    ],
  },
  icons: {
    icon: "/img/icons/favicon.png",
    apple: "/img/icons/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${agdasima.variable} ${montserrat.variable}`}>
      <body className={styles.body}>
        <AnalyticsConsent>
          <main className={`${styles.main} d-flex flex-column justify-content-center`}>
            {children}
          </main>
          <footer className={styles.footer}>
            <CookiePreferencesButton />
          </footer>
        </AnalyticsConsent>
      </body>
    </html>
  );
}
