'use client'

import React, { useState } from "react";
import OtpInput from "./OtpInput";
import styles from "./TicketRegistration.module.css";
import { websiteSettings } from "../../config/website-settings";

// Dummy async functions to simulate API calls
async function requestOtp(email: string) {
  const url = `${websiteSettings.admittoUrl}/teams/bitbash/events/bitbash-2026/public/otp`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });
    if (!res.ok) {
      return { success: false };
    }
    // The response is not used for OTP, as OTP is sent to email
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

async function verifyOtp(email: string, code: string) {
  const url = `${websiteSettings.admittoUrl}/teams/bitbash/events/bitbash-2026/public/verify`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, code })
    });
    if (!res.ok) {
      return { success: false };
    }
    return { success: true, registrationToken: (await res.json()).registrationToken };
  } catch (err) {
    return { success: false };
  }
}

async function register(details: { firstName: string; lastName: string; company: string; registrationToken: string }) {
  await new Promise(r => setTimeout(r, 500));
  return { success: true };
}

export default function TicketRegistration() {
  // Load state from localStorage if available
  const getInitial = (key: string, fallback: any) => {
    if (typeof window === "undefined") return fallback;
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch {
      return fallback;
    }
  };
  const [step, setStep] = useState(() => getInitial("ticketStep", 1));
  const [email, setEmail] = useState(() => getInitial("ticketEmail", ""));
  const [otp, setOtp] = useState(() => getInitial("ticketOtp", ["", "", "", "", "", ""]));
  const [registrationToken, setRegistrationToken] = useState(() => getInitial("ticketToken", ""));
  const [details, setDetails] = useState(() => getInitial("ticketDetails", { firstName: "", lastName: "", company: "" }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Persist state to localStorage
  React.useEffect(() => { localStorage.setItem("ticketStep", JSON.stringify(step)); }, [step]);
  React.useEffect(() => { localStorage.setItem("ticketEmail", JSON.stringify(email)); }, [email]);
  React.useEffect(() => { localStorage.setItem("ticketOtp", JSON.stringify(otp)); }, [otp]);
  React.useEffect(() => { localStorage.setItem("ticketToken", JSON.stringify(registrationToken)); }, [registrationToken]);
  React.useEffect(() => { localStorage.setItem("ticketDetails", JSON.stringify(details)); }, [details]);

  // Step 1: Email input
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await requestOtp(email);
    setLoading(false);
    if (res.success) {
      setStep(2);
    } else {
      setError("Failed to send OTP. Try again.");
    }
  };

  // Step 2: OTP input
  const handleOtpChange = (idx: number, value: string) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[idx] = value;
      setOtp(newOtp);
      // Auto-focus next input
      if (value && idx < 5) {
        document.getElementById(`otp-${idx + 1}`)?.focus();
      }
    }
  };
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const code = otp.join("");
    const res = await verifyOtp(email, code);
    setLoading(false);
    if (res.success) {
      setRegistrationToken(res.registrationToken);
      setStep(3);
    } else {
      setError("Invalid OTP. Try again.");
    }
  };

  // Step 3: Details input
  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDetails({ ...details, [e.target.name]: e.target.value });
  };
  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await register({ ...details, registrationToken });
    setLoading(false);
    if (res.success) {
      setStep(4);
    } else {
      setError("Registration failed. Try again.");
    }
  };

  // Step 4: Thank you
  if (step === 4) {
    return (
      <div className="ticket-thankyou text-center">
        <h2>Thank you for registering!</h2>
        <p>We've received your registration. Check your email for confirmation.</p>
      </div>
    );
  }

  return (
    <div className="ticket-registration">
      {step === 1 && (
        <form onSubmit={handleEmailSubmit} className="ticket-form">
          <h3>Register for Bitbash</h3>
          <label htmlFor="email">Email address</label>
          <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="form-control mb-2" />
          <button type="submit" className="btn btn-primary" disabled={loading}>Send verification code</button>
          {error && <div className="text-danger mt-2">{error}</div>}
        </form>
      )}
      {step === 2 && (
        <form onSubmit={handleOtpSubmit} className="ticket-form">
          <h3>Enter the 6-digit code</h3>
          <OtpInput value={otp} onChange={newOtp => setOtp(newOtp)} />
          <button type="submit" className="btn btn-primary" disabled={loading}>Verify code</button>
          {error && <div className="text-danger mt-2">{error}</div>}
        </form>
      )}
      {step === 3 && (
        <form onSubmit={handleDetailsSubmit} className="ticket-form">
          <h3>Your Details</h3>
          <label htmlFor="firstName">First Name</label>
          <input type="text" id="firstName" name="firstName" value={details.firstName} onChange={handleDetailsChange} required className="form-control mb-2" />
          <label htmlFor="lastName">Last Name</label>
          <input type="text" id="lastName" name="lastName" value={details.lastName} onChange={handleDetailsChange} required className="form-control mb-2" />
          <label htmlFor="company">Company Name</label>
          <input type="text" id="company" name="company" value={details.company} onChange={handleDetailsChange} className="form-control mb-2" />
          <button type="submit" className="btn btn-primary" disabled={loading}>Complete Registration</button>
          {error && <div className="text-danger mt-2">{error}</div>}
        </form>
      )}
    </div>
  );
}
