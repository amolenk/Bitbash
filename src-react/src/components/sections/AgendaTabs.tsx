import React from "react";
import Link from "next/link";
import styles from "./AgendaTabs.module.css";

interface AgendaTabsProps {
  dates: Date[];
  selectedDate: Date;
}

export default function AgendaTabs({ dates, selectedDate }: AgendaTabsProps) {
  return (
    <ul className={styles.tabs}>
      {dates.map(date => {
        const isActive = date.getTime() === selectedDate.getTime();
        return (
          <li
            key={date.toISOString()}
            className={isActive ? `${styles.tabsItem} ${styles.tabsItemActive}` : styles.tabsItem}
          >
            <Link className={styles.tabsLink} href={`/agenda?date=${date.toISOString()}`}>
              {date.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", timeZone: 'Europe/Amsterdam' })}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
