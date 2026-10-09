"use client";

import { COOKIE_PREFERENCES_EVENT } from "./AnalyticsConsent";
import styles from "./CookiePreferencesButton.module.css";

export default function CookiePreferencesButton() {
    return (
        <button
            className={styles.button}
            type="button"
            onClick={() => window.dispatchEvent(new Event(COOKIE_PREFERENCES_EVENT))}
        >
            Cookie preferences
        </button>
    );
}
