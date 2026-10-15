import Image from "next/image";
import Countdown from "./Countdown";
import editionBanner from "@/public/img/edition.png";
import styles from "./Hero.module.css";
import { websiteSettings } from "@/src/config/website-settings";

export default function Hero() {
  return (
    <section id="hero" className={styles.hero}>
      <div className={styles.heroContainer}>
        <Image
          className={`${styles.banner} pb-10`}
          src={editionBanner}
          sizes="(max-width: 991px) 90vw, 75vw"
          priority
          alt={websiteSettings.currentEdition.description}
          data-aos="zoom-in"
          data-aos-delay="100"
        />
        
        <Countdown />
      </div>
    </section>
  );
}