"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./AnalyticsConsent.module.css";

export const GOOGLE_ANALYTICS_MEASUREMENT_ID = "G-KZWM1BBHB7";
export const ANALYTICS_READY_EVENT = "bitbash:analytics-ready";
export const COOKIE_PREFERENCES_EVENT = "bitbash:open-cookie-preferences";

const consentCookieName = "bitbash-analytics-consent";
const consentCookieMaxAge = 60 * 60 * 24 * 183;

type Consent = "granted" | "denied";

declare global {
    interface Window {
        dataLayer?: unknown[][];
        gtag?: (...args: unknown[]) => void;
    }
}

function readConsent(): Consent | null {
    const value = document.cookie
        .split("; ")
        .find(cookie => cookie.startsWith(`${consentCookieName}=`))
        ?.split("=")[1];

    return value === "granted" || value === "denied" ? value : null;
}

export function hasAnalyticsConsent() {
    return typeof document !== "undefined" && readConsent() === "granted";
}

export function trackRegistrationComplete() {
    if (hasAnalyticsConsent() && window.gtag) {
        window.gtag("event", "registration_complete");
    }
}

function saveConsent(consent: Consent) {
    document.cookie = `${consentCookieName}=${consent}; Max-Age=${consentCookieMaxAge}; Path=/; SameSite=Lax`;
}

function removeGoogleAnalyticsCookies() {
    for (const name of ["_ga", `_ga_${GOOGLE_ANALYTICS_MEASUREMENT_ID.slice(2)}`]) {
        document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
    }
}

function configureGoogleAnalytics() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || ((...args: unknown[]) => window.dataLayer?.push(args));
    window.gtag("js", new Date());
    window.gtag("config", GOOGLE_ANALYTICS_MEASUREMENT_ID, { send_page_view: false });

    if (!document.getElementById("google-analytics")) {
        const script = document.createElement("script");
        script.id = "google-analytics";
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_MEASUREMENT_ID}`;
        document.head.append(script);
    }

    window.dispatchEvent(new Event(ANALYTICS_READY_EVENT));
}

export default function AnalyticsConsent({ children }: Readonly<{ children: React.ReactNode }>) {
    const [consent, setConsent] = useState<Consent | null>(null);
    const [hasReadConsent, setHasReadConsent] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setConsent(readConsent());
        setHasReadConsent(true);

        const openPreferences = () => setConsent(null);
        window.addEventListener(COOKIE_PREFERENCES_EVENT, openPreferences);
        return () => window.removeEventListener(COOKIE_PREFERENCES_EVENT, openPreferences);
    }, []);

    useEffect(() => {
        if (!hasReadConsent) {
            return;
        }

        const disableKey = `ga-disable-${GOOGLE_ANALYTICS_MEASUREMENT_ID}`;
        if (consent === "granted") {
            window[disableKey as keyof Window] = false as never;
            configureGoogleAnalytics();
        } else if (consent === "denied") {
            window[disableKey as keyof Window] = true as never;
            removeGoogleAnalyticsCookies();
        }
    }, [consent, hasReadConsent]);

    useEffect(() => {
        if (consent === "granted" && window.gtag) {
            window.gtag("event", "page_view", { page_path: pathname });
        }
    }, [consent, pathname]);

    function chooseConsent(choice: Consent) {
        saveConsent(choice);
        setConsent(choice);
    }

    return (
        <>
            {hasReadConsent && consent === null && (
                <div className={styles.backdrop}>
                    <section
                        className={styles.banner}
                        role="dialog"
                        aria-labelledby="cookie-preferences-title"
                    >
                        <h2 id="cookie-preferences-title">Cookie preferences</h2>
                        <p>
                            Bitbash uses optional analytics cookies to understand website traffic, campaigns and registrations.
                            You can change your choice at any time.
                        </p>
                        <p><Link href="/privacy">Read our privacy and cookie policy</Link>.</p>
                        <div className={styles.actions}>
                            <button className="btn btn-outline-light" type="button" onClick={() => chooseConsent("denied")}>
                                Reject analytics
                            </button>
                            <button className="btn btn-primary" type="button" onClick={() => chooseConsent("granted")}>
                                Accept analytics
                            </button>
                        </div>
                    </section>
                </div>
            )}
            {children}
        </>
    );
}
