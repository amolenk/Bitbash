import styles from "./Section.module.css";

interface SectionProps {
  id?: string;
  headerText?: string;
  subText?: string;
  extraClass?: string;
  fadeUp?: boolean;
  children: React.ReactNode;
}

export default function Section({ 
  id, 
  headerText, 
  subText, 
  extraClass, 
  fadeUp,
  children 
}: SectionProps) {
  const sectionClass = `${extraClass ? styles[extraClass] || extraClass : ''} ${fadeUp ? 'fade-up' : ''}`.trim();
  
  return (
    <section 
      id={id} 
      className={sectionClass}
      data-aos={fadeUp ? "fade-up" : undefined}
    >
      <div className={`container ${styles.container}`}>
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