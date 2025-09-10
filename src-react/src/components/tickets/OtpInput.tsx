'use client'

import React, { useRef } from "react";
import styles from "./TicketRegistration.module.css";

interface OtpInputProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export default function OtpInput({ value, onChange }: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (idx: number, val: string) => {
    if (/^\d?$/.test(val)) {
      const newValue = [...value];
      newValue[idx] = val;
      onChange(newValue);
      if (val && idx < value.length - 1) {
        inputsRef.current[idx + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  return (
    <div className={styles.otpInputs}>
      {value.map((digit, idx) => (
        <input
          key={idx}
          ref={el => (inputsRef.current[idx] = el)}
          id={`otp-${idx}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={e => handleChange(idx, e.target.value)}
          onKeyDown={e => handleKeyDown(idx, e)}
          className={styles.otpInput}
          required
          placeholder={`Digit ${idx + 1}`}
          aria-label={`OTP digit ${idx + 1}`}
        />
      ))}
    </div>
  );
}
