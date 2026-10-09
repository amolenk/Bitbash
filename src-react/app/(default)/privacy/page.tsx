import type { Metadata } from "next";

import Section from "@/src/components/layout/Section";
import MainLayout from "@/src/components/layout/MainLayout";

export const metadata: Metadata = {
    title: "Privacy & Cookies | Bitbash",
};

export default function PrivacyPage() {
    return (
        <MainLayout>
            <Section headerText="Privacy & Cookies" sectionBackground={2}>
                <div className="text-light">
                    <p className="lead">This page explains how Bitbash uses cookies and analytics on this website.</p>

                    <h2>Controller and contact</h2>
                    <p>Info Support B.V. is responsible for processing personal data for the Bitbash website. For privacy questions, contact <a href="mailto:bitbash@infosupport.com">bitbash@infosupport.com</a>. Our broader <a href="https://www.infosupport.com/en/privacy-statement/">Info Support privacy statement</a> also applies.</p>

                    <h2>Analytics cookies</h2>
                    <p>With your permission, Bitbash uses Google Analytics 4 to measure website traffic, campaign channels and sources, and completed registrations. Google Analytics may provide aggregated demographic and interest reporting when Google Signals is enabled. We do not send registration form data to Google Analytics.</p>
                    <p>Google Analytics uses the <code>_ga</code> and <code>_ga_KZWM1BBHB7</code> cookies. Analytics event data is retained in Google Analytics for 14 months.</p>

                    <h2>Your choice</h2>
                    <p>Google Analytics is not loaded until you accept analytics cookies. Your choice is stored in the <code>bitbash-analytics-consent</code> cookie for six months. You can withdraw or change consent at any time through the Cookie preferences control in the footer. Withdrawing consent stops further analytics measurement and removes the Google Analytics cookies set by this site.</p>

                    <h2>Google</h2>
                    <p>Google Analytics is provided by Google. For details of Google&apos;s processing, see the <a href="https://policies.google.com/privacy">Google Privacy Policy</a>.</p>
                </div>
            </Section>
        </MainLayout>
    );
}
