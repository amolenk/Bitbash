'use client'

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { websiteSettings } from "../../config/website-settings";

export default function DetailsForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";
  const email = params.get("email") || "";
  const [details, setDetails] = useState({ firstName: "", lastName: "", company: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function register(details: { firstName: string; lastName: string; company: string; registrationToken: string; email: string }) {
    const url = `${websiteSettings.admittoUrl}/teams/bitbash/events/bitbash-2026/public/register`; 
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: details.email,
            firstName: details.firstName,
            lastName: details.lastName,
            additionalDetails: [
                { name: "Company", value: details.company }
            ],
            tickets: ['general'],
            verificationToken: details.registrationToken
        })
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDetails({ ...details, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const success = await register({ ...details, registrationToken: token, email });
    setLoading(false);
    if (success) {
      router.push("/register/thankyou");
    } else {
      setError("Registration failed. Try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="ticket-form">
      <h3>Your Details</h3>
      <label htmlFor="firstName">First Name</label>
      <input type="text" id="firstName" name="firstName" value={details.firstName} onChange={handleChange} required className="form-control mb-2" />
      <label htmlFor="lastName">Last Name</label>
      <input type="text" id="lastName" name="lastName" value={details.lastName} onChange={handleChange} required className="form-control mb-2" />
      <label htmlFor="company">Company Name</label>
      <input type="text" id="company" name="company" value={details.company} onChange={handleChange} className="form-control mb-2" />
      <button type="submit" className="btn btn-primary" disabled={loading}>Complete Registration</button>
      {error && <div className="text-danger mt-2">{error}</div>}
    </form>
  );
}
