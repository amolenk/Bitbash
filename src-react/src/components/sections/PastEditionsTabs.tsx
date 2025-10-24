import React from "react";
import Link from "next/link";
import styles from "./AgendaTabs.module.css";
import { PastEditionSettings } from "@/src/config/website-settings";

interface PastEditionsTabsProps {
  editions: PastEditionSettings[];
  selectedEditionSlug: string;
}

export default function PastEditionsTabs({ editions, selectedEditionSlug }: PastEditionsTabsProps) {
  return (
    <ul className={styles.tabs}>
      {editions.map(edition => {
        const isActive = edition.slug === selectedEditionSlug;
        return (
          <li
            key={edition.slug}
            className={isActive ? `${styles.tabsItem} ${styles.tabsItemActive}` : styles.tabsItem}
          >
            <Link className={styles.tabsLink} href={`/editions?edition=${edition.slug}`}>
              {edition.description}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
