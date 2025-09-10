'use client'

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { websiteSettings } from "../../config/website-settings";

export default function EmailForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function requestOtp(email: string) {
    const url = `${websiteSettings.admittoUrl}/teams/bitbash/events/bitbash-2026/public/otp`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const success = await requestOtp(email);
    setLoading(false);
    if (success) {
      router.push(`/register/verify?email=${encodeURIComponent(email)}`);
    } else {
      setError("Failed to send OTP. Try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="ticket-form">
      <h3>Register for Bitbash</h3>
      <label htmlFor="email">Email address</label>
      <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="form-control mb-2" />
      <button type="submit" className="btn btn-primary" disabled={loading}>Send verification code</button>
      {error && <div className="text-danger mt-2">{error}</div>}
    </form>
  );
}
