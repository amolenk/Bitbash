"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import styles from "./NavMenu.module.css";

export default function NavMenu() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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

  return (
    <header 
      id="header" 
      className={`${styles.header} d-flex align-items-center ${isScrolled ? styles.headerScrolled : ''}`}
    >
      <div className="container-fluid container-xxl align-items-center">
        <div className={styles.logoMobile}>
          <Link href="/" passHref>
            <img src="/img/logo.png" alt="Home" title="" />
          </Link>
        </div>
        <nav 
          id="navbar" 
          className={`${styles.navbar} ${isMobileMenuOpen ? styles.navbarMobile : ''} navbar order-last order-lg-0`}
        >
          <ul>
            <li><Link className={styles.navLink} href="/">Home</Link></li>
            <li><Link className={styles.navLink} href="/agenda">Agenda</Link></li>
            <li className={styles.logo}>
              <Link href="/">
                <img src="/img/logo.png" alt="Logo" title="" />
              </Link>
            </li>
            <li><Link className={styles.navLink} href="/speakers">Speakers</Link></li>
            <li><Link className={styles.navLink} href="/tickets">Tickets</Link></li>
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