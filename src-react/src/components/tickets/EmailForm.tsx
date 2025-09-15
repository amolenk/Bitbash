'use client'

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { websiteSettings } from "../../config/website-settings";

export default function EmailForm() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);

    // TODO Get Admitto Team and Event IDs from config
    async function requestOtp(email: string) {
        const url = `${websiteSettings.admittoUrl}/teams/bitbash/events/bitbash-2026/public/otp`;
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData?.detail || "Verification request failed.");
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await requestOtp(email);
            router.push(`/register/verify?email=${encodeURIComponent(email)}`);
        }
        catch (err: any) {
            setLoading(false);
            setError(err.message || "Verification request failed. Please try again.");
        }
    };

    const isFormValid = () => formRef.current?.checkValidity() ?? false;

    return (
        <div className="w-75 mx-auto text-center">
            <form ref={formRef} onSubmit={handleSubmit} className="ticket-form">
                <div className="form-group row justify-content-center align-items-center mb-2">
                    <label htmlFor="email" className="col-auto col-form-label text-end">
                        Email:
                    </label>
                    <div className="col-9">
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className="form-control"
                        />
                    </div>
                </div>
                <button type="submit" className="btn btn-primary mt-2" disabled={loading || !isFormValid()}>
                    {loading && (
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    )}
                    Register
                </button>
                {error && <div className="text-danger mt-2">{error}</div>}
            </form>
        </div>
    );
}
