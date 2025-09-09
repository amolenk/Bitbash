"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import styles from "./NavMenu.module.css";
import { usePathname } from "next/navigation";

export default function NavMenu() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileNavigation = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

console.log(pathname);

  return (
    <header 
      className={`${styles.header} d-flex align-items-center ${isScrolled ? styles.headerScrolled : ''}`}
    >
      <div className="container-fluid container-xxl align-items-center">
        <div className={styles.logoMobile}>
          <Link href="/" passHref>
            <img src="/img/logo.png" alt="Home" title="" />
          </Link>
        </div>
        <nav 
          className={
            isMobileMenuOpen
              ? `${styles.navbarMobile} order-last order-lg-0`
              : `navbar ${styles.navbar} order-last order-lg-0`
          }
        >
          <ul>
            <li><Link className={`${styles.navLink} nav-link ${pathname === "/" ? styles.active : ""}`} href="/">Home</Link></li>
            <li><Link className={`${styles.navLink} nav-link ${pathname === "/agenda" ? styles.active : ""}`} href="/agenda">Agenda</Link></li>
            <li className={styles.logo}>
              <Link href="/">
                <img src="/img/logo.png" alt="Logo" title="" />
              </Link>
            </li>
            <li><Link className={`${styles.navLink} nav-link ${pathname === "/speakers" ? styles.active : ""}`} href="/speakers">Speakers</Link></li>
            <li><Link className={`${styles.navLink} nav-link ${pathname === "/tickets" ? styles.active : ""}`} href="/tickets">Tickets</Link></li>
          </ul>
          <i 
            className={`bi ${isMobileMenuOpen ? 'bi-x' : 'bi-list'} ${styles.mobileNavToggle}`}
            onClick={toggleMobileNavigation}
          ></i>
        </nav>
      </div>
    </header>
  );
}