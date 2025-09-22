import Countdown from "./Countdown";
import styles from "./Hero.module.css";
import { websiteSettings } from "@/src/config/website-settings";

export default function Hero() {
  return (
    <section id="hero" className={styles.hero}>
      <div className={styles.heroContainer}>
        <img 
          className={`${styles.banner} pb-10`} 
          src="/img/edition.png?v=20250716" 
          alt={websiteSettings.currentEdition.description}
          data-aos="zoom-in" 
          data-aos-delay="100" 
        />
        
        <Countdown />
      </div>
    </section>
  );
}