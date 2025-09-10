import styles from "./Section.module.css";

interface SectionProps {
  id?: string;
  headerText?: string;
  subText?: string;
  extraClass?: string;
  sectionBackground?: number;
  fadeUp?: boolean;
  children: React.ReactNode;
}

export default function Section({ 
  id, 
  headerText, 
  subText, 
  extraClass, 
  sectionBackground,
  fadeUp,
  children 
}: SectionProps) {
  const rocketClass = sectionBackground ? styles[`rocket${sectionBackground}`] : '';
  const sectionClass = [
    rocketClass,
    extraClass ? styles[extraClass] || extraClass : ''
  ].filter(Boolean).join(' ');
  
  return (
    <section 
      id={id} 
      className={sectionClass}
      data-aos={fadeUp ? "fade-up" : undefined}
    >
      <div className={`${styles.sectionContainer} container`}>
        {headerText && (
          <div className={styles.sectionHeader}>
            <h2>{headerText}</h2>
            {subText && <h4>{subText}</h4>}
          </div>
        )}
        
        {children}
      </div>
    </section>
  );
}