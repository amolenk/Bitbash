'use client'

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import OtpInput from "./OtpInput";
import SpinningButton from "../common/SpinningButton";
import { verifyOtp as admittoVerifyOtp } from "../../api/admitto";

export default function OtpVerifyForm() {
    const router = useRouter();
    const params = useSearchParams();
    const email = params.get("email") || "";
    const couponCode = params.get("coupon");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const code = otp.join("");
        try {
            const verificationResult = await admittoVerifyOtp(email, code);
            // If Admitto found an existing registration, let the attendee update it.
            if (verificationResult.registrationId) {
                const redirectParams = new URLSearchParams({ redirect: "true" });
                if (couponCode) redirectParams.set("coupon", couponCode);
                router.push(`/tickets/edit/${verificationResult.registrationId}?${redirectParams.toString()}`);
            } else {
                const registerParams = new URLSearchParams({
                    token: verificationResult.registrationToken,
                    email
                });
                if (couponCode) registerParams.set("coupon", couponCode);
                router.push(`/tickets/register?${registerParams.toString()}`);
            }
        } catch (err: unknown) {
            setLoading(false);
            setError(err instanceof Error ? err.message : "Verification failed. Please try again.");
        }
    };
 
    return (
        <form onSubmit={handleSubmit} className="ticket-form">
            {error && <div className="text-danger my-3">{error}</div>}
            <OtpInput value={otp} onChange={setOtp} />
            <SpinningButton loading={loading} disabled={otp.some(digit => digit === "")} className="mt-2">
                Verify email
            </SpinningButton>
        </form>
    );
}
