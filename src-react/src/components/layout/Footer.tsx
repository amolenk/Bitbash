import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={`${styles.footer} mt-auto pt-4 text-center`}>
      <p>
        <a href="https://www.linkedin.com/company/bitbashconf/" target="_blank" rel="noopener noreferrer">
          <i className={`bi bi-linkedin ${styles.footerIcon}`}></i>
          LinkedIn
        </a>
        <a href="https://x.com/bitbashconf" target="_blank" rel="noopener noreferrer">
          <i className={`bi bi-twitter-x ${styles.footerIcon}`}></i>
          X
        </a>
        <a href="mailto:bitbash@infosupport.com">
          <i className={`bi bi-envelope ${styles.footerIcon}`}></i>
          E-mail
        </a>
        <Link href="/code-of-conduct">
          <i className={`bi bi-peace ${styles.footerIcon}`}></i>
          Code of Conduct
        </Link>
      </p>
    </footer>
  );
}