'use client';

import { useEffect } from "react";
import styles from "./HubSpotForm.module.css";

declare global {
    interface Window {
        hbspt?: any;
    }
}

export default function HubSpotForm() {
    useEffect(() => {
        // Load the HubSpot script
        const script = document.createElement("script");
        script.src = "//js-eu1.hsforms.net/forms/embed/v2.js";
        script.type = "text/javascript";
        script.async = true;
        script.onload = () => {
            if (window.hbspt) {
                window.hbspt.forms.create({
                    region: "eu1",
                    portalId: "25807913",
                    formId: "af262814-1c17-485f-a60a-55a21c4d5d69",
                    target: "#hubspot-form"
                });
            }
        };
        document.body.appendChild(script);
    }, []);

    return (
        <>
            <style>
                {`
                #hubspot-form .hs-form { color: white; }
                #hubspot-form .hs-form-field { color: white; }
                #hubspot-form ul.hs-error-msgs { font-size: 20px; color: #F924A1; list-style-type: none; padding: 0; }
                #hubspot-form div.hs-fieldtype-text .hs-input { width: 100%; }
                #hubspot-form div.field { margin-bottom: 8px; }
                #hubspot-form div ul { list-style-type: none; padding: 0; }
                #hubspot-form div li label span { padding-left: 12px; }
                #hubspot-form input.hs-button { background: #269BB9; border: 0; color: white; }
                `}
            </style>

            <div className={styles.hubspotContainer}>
                <div id="hubspot-form" className={styles.hubspotForm}></div>
            </div>
        </>
    );
}