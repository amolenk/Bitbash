"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { websiteSettings } from "../../config/website-settings";
import styles from "./Countdown.module.css";
import countdownTheme from "@/public/img/countdown-theme.png";
import countdownBottom from "@/public/img/countdown-bottom.png";
import countdownTop from "@/public/img/countdown-top.png";

const imageSizes = "(max-width: 991px) 350px, 550px";

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
    // Format in the event's time zone; getDate() etc. would use the visitor's time zone.
    const format = (date: Date, options: Intl.DateTimeFormatOptions) =>
      date.toLocaleDateString('en-US', { ...options, timeZone: 'Europe/Amsterdam' });
    return (
      <>
        <span className={styles.dateDays}>{format(preConDate, { day: 'numeric' })}/{format(conferenceDate, { day: 'numeric' })}</span>
        <span className={styles.dateMonthYear}> {format(preConDate, { month: 'short' })} {format(preConDate, { year: 'numeric' })}</span>
      </>
    );
  };

  return (
    <div className={styles.countdown}>
      <Image
        className={styles.countdownImageBottom}
        src={countdownTheme}
        sizes={imageSizes}
        alt="Countdown background"
      />
      <Image
        className={styles.countdownImageMiddle}
        src={countdownBottom}
        sizes={imageSizes}
        alt="Countdown layer"
      />
      <div className={styles.countdownText}>
        <span id="days">{days}</span>
      </div>
      <Image
        className={styles.countdownImageTop}
        src={countdownTop}
        sizes={imageSizes}
        alt="Countdown foreground"
      />
      <span className={styles.date}>
        {formatDate()}
      </span>
    </div>
  );
}