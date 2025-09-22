"use client"

import NavMenu from "./NavMenu";
import Footer from "./Footer";
import { useEffect } from "react";
import AOS from '@/public/aos/aos.js';
import styles from './MainLayout.module.css';
import BackToTop from "./BackToTop";
import { usePathname } from "next/navigation";

interface MainLayoutProps {
  children: React.ReactNode;
}

// TODO Can be merged with RootLayout in app/layout.tsx
export default function MainLayout({ children }: MainLayoutProps) {

const pathname = usePathname();

useEffect(() => {
    if (typeof window !== "undefined") {
      AOS.init({
        duration: 1000,
        easing: "ease-in-out",
        once: true,
        mirror: false,
      });
    }

    // Animate on scroll
    window.addEventListener('load', () => {

        AOS.init({
            duration: 1000,
            easing: 'ease-in-out',
            once: true,
            mirror: false
        })
    });
  }, []);

  return (
    <>
      <NavMenu />
      <main className={`${styles.main} d-flex flex-column min-vh-100`}>

        {/* Header spacer */}
        {pathname !== "/" && (
          <div style={{ height: '150px' }}></div>
        )}

        {children}
        <Footer />
      </main>

      <BackToTop />
    </>
  );
}