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
            <h1>{headerText}</h1>
            {subText && <h3>{subText}</h3>}
          </div>
        )}
        
        {children}
      </div>
    </section>
  );
}