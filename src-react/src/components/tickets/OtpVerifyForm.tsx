'use client'

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import OtpInput from "./OtpInput";
import { websiteSettings } from "../../config/website-settings";

export default function OtpVerifyForm() {
    const router = useRouter();
    const params = useSearchParams();
    const email = params.get("email") || "";
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function verifyOtp(email: string, code: string) {
        const url = `${websiteSettings.admittoUrl}/teams/bitbash/events/bitbash-2026/public/verify`;
        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code })
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData?.detail || "Verification failed.");
            }
            return (await res.json()).registrationToken;
        } catch (err: any) {
            throw err;
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const code = otp.join("");
        try {
            const token = await verifyOtp(email, code);
            setLoading(false);
            if (token) {
                router.push(`/register/details?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`);
            }
        } catch (err: any) {
            setLoading(false);
            setError(err.message || "Verification failed. Please try again.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="ticket-form">
            {error && <div className="text-danger my-3">{error}</div>}
            <OtpInput value={otp} onChange={setOtp} />
            <button type="submit" className="btn btn-primary mt-2" disabled={loading || otp.some(digit => digit === "")}>Continue</button>
        </form>
    );
}
