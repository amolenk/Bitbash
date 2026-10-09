"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { websiteSettings } from "@/src/config/website-settings";
import styles from "./AnalyticsConsent.module.css";

export const COOKIE_PREFERENCES_EVENT = "bitbash:open-cookie-preferences";

const analyticsSettings = websiteSettings.analytics;
const consentCookieMaxAge = 60 * 60 * 24 * analyticsSettings.consentDurationDays;

type Consent = "granted" | "denied";

declare global {
    interface Window {
        dataLayer?: unknown[][];
        gtag?: (...args: unknown[]) => void;
        [key: `ga-disable-${string}`]: boolean | undefined;
    }
}

function readConsent(): Consent | null {
    const value = document.cookie
        .split("; ")
        .find(cookie => cookie.startsWith(`${analyticsSettings.consentCookieName}=`))
        ?.split("=")[1];

    return value === "granted" || value === "denied" ? value : null;
}

export function hasAnalyticsConsent() {
    return typeof document !== "undefined" && readConsent() === "granted";
}

export function trackRegistrationComplete() {
    if (hasAnalyticsConsent() && window.gtag) {
        window.gtag("event", "registration_complete", analyticsPageParameters());
    }
}

function saveConsent(consent: Consent) {
    document.cookie = `${analyticsSettings.consentCookieName}=${consent}; Max-Age=${consentCookieMaxAge}; Path=/; SameSite=Lax`;
}

function removeGoogleAnalyticsCookies() {
    for (const name of ["_ga", `_ga_${analyticsSettings.measurementId.slice(2)}`]) {
        for (const domain of ["", "; Domain=.bitbash.nl"]) {
            document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${domain}`;
        }
    }
}

function analyticsPageParameters() {
    const pageUrl = new URL(window.location.pathname, window.location.origin).href;
    return { page_location: pageUrl, page_path: window.location.pathname };
}

function configureGoogleAnalytics() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || ((...args: unknown[]) => window.dataLayer?.push(args));
    window.gtag("js", new Date());
    window.gtag("config", analyticsSettings.measurementId, {
        send_page_view: false,
        cookie_domain: "bitbash.nl",
    });

    if (!document.getElementById("google-analytics")) {
        const script = document.createElement("script");
        script.id = "google-analytics";
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsSettings.measurementId}`;
        document.head.append(script);
    }
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

        const disableKey = `ga-disable-${analyticsSettings.measurementId}`;
        const googleAnalyticsWindow = window as unknown as Record<string, boolean | undefined>;
        if (consent === "granted") {
            googleAnalyticsWindow[disableKey] = false;
            configureGoogleAnalytics();
        } else if (consent === "denied") {
            googleAnalyticsWindow[disableKey] = true;
            removeGoogleAnalyticsCookies();
        }
    }, [consent, hasReadConsent]);

    useEffect(() => {
        if (consent === "granted" && window.gtag) {
            window.gtag("event", "page_view", analyticsPageParameters());
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
                        <div className={styles.copy}>
                            <h2 id="cookie-preferences-title">Cookie preferences</h2>
                            <p>
                                Bitbash uses optional analytics cookies to understand website traffic and registrations. You can change your choice at any time. <Link href="/privacy">Read our privacy and cookie policy</Link>.
                            </p>
                        </div>
                        <div className={styles.actions}>
                            <button className="btn btn-primary" type="button" onClick={() => chooseConsent("denied")}>
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
