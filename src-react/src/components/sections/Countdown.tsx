"use client";

import { useState, useEffect } from "react";
import { websiteSettings } from "../../config/website-settings";
import styles from "./Countdown.module.css";

export default function Countdown() {
  const [days, setDays] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const calculateDays = () => {
      const preConDate = new Date(websiteSettings.currentEdition.workshopsDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const diffTime = preConDate.getTime() - today.getTime();
      const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      
      setDays(diffDays);
    };

    calculateDays();
    
    // Update daily at midnight
    const interval = setInterval(calculateDays, 1000 * 60 * 60 * 24);
    
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const preConDate = new Date(websiteSettings.currentEdition.workshopsDate);
  const conferenceDate = new Date(websiteSettings.currentEdition.conferenceDate);
  
  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = { month: 'short' };
    const monthName = preConDate.toLocaleDateString('en-US', options);
    return (
      <>
        <span className={styles.dateDays}>{preConDate.getDate()}/{conferenceDate.getDate()}</span>
        <span className={styles.dateMonthYear}> {monthName} {preConDate.getFullYear()}</span>
      </>
    );
  };

  return (
    <div className={styles.countdown}>
      <img 
        className={styles.countdownImageBottom} 
        src={`/img/countdown-egg.gif?time=${Date.now()}`} 
        alt="Countdown background"
      />
      <img 
        className={styles.countdownImageMiddle} 
        src="/img/countdown-bottom.png?v=20250716" 
        alt="Countdown layer"
      />
      <div className={styles.countdownText}>
        <span id="days">{days}</span>
      </div>
      <img 
        className={styles.countdownImageTop} 
        src="/img/countdown-top.png?v=20250716" 
        alt="Countdown foreground"
      />
      <span className={styles.date}>
        {formatDate()}
      </span>
    </div>
  );
}