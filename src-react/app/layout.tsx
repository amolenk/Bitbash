import type { Metadata } from "next";
// import "./globals.css";
import Script from "next/script";

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
        url: "https://www.bitbash.nl/img/winter-2024/og-image.png",
        width: 1200,
        height: 628,
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
        {/* CSS Files */}
        <link href="/aos/aos.css" rel="stylesheet" />
        <link href="/bootstrap/bootstrap.min.css" rel="stylesheet" />
        <link href="/bootstrap-icons/bootstrap-icons.min.css" rel="stylesheet" />
        <link href="/galleria/themes/twelve/galleria.twelve.min.css" rel="stylesheet" />
        <link href="/app.css" rel="stylesheet" />
      </head>
      <body>
        {children}
        
        {/* JavaScript libraries */}
        <Script src="/aos/aos.js" strategy="beforeInteractive" />
        <Script src="/jquery/jquery-3.7.1.min.js" strategy="beforeInteractive" />
        <Script src="/galleria/galleria.min.js" strategy="beforeInteractive" />
        <Script src="/galleria/themes/twelve/galleria.twelve.min.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}