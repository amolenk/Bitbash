import Section from "../layout/Section";
import styles from "./Venue.module.css";

export default function Venue() {
  return (
    <Section headerText="Venue" extraClass={`${styles.venue} mt-4`}  sectionBackground={2} fadeUp={true}>
      <div className={`row ${styles.venue}`}>
        <div className={`col-lg-8 p-0 ${styles.venueMap}`}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2454.123182109566!2d5.532747051703135!3d52.041069379263476!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0xb1c3da5833832cac!2sInfo%20Support%20Kenniscentrum%20%26%20Traininglocatie%20Veenendaal!5e0!3m2!1sen!2snl!4v1654233019955!5m2!1sen!2snl"
            width="100%" 
            height="450" 
            style={{border: 0}} 
            allowFullScreen 
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className={`col-lg-4 ${styles.venueInfo}`}>
          <div className="row justify-content-center">
            <div className={`${styles.info} col-11 col-lg-8 position-relative`}>
              <img className={styles.logo} src="/img/info-support-vertical.png" alt="Info Support" />
              <p className="lead text-light">Kruisboog 42, 3905 TG</p>
              <p className="lead text-light">Veenendaal, The Netherlands</p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}