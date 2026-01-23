import type { Metadata } from "next";
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
    <html lang="en">
      <head>
        {/* Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css?family=Agdasima:400,700"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css?family=Montserrat:600"
          rel="stylesheet"
        />
      </head>
      <body>
        <main className={`${styles.main} d-flex flex-column min-vh-100 justify-content-center`}>
          {children}
        </main>
      </body>
    </html>
  );
}