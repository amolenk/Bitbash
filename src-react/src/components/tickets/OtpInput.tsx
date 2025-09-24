'use client'

import React, { useRef } from "react";
import styles from "./OtpInput.module.css";

interface OtpInputProps {
    value: string[];
    onChange: (value: string[]) => void;
}

export default function OtpInput({ value, onChange }: OtpInputProps) {
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

    const setAndFocusNext = (idx: number, newValue: string[]) => {
        onChange(newValue);
        // Focus the first empty input after the last filled one, or the last box
        const nextEmpty = newValue.findIndex((v, i) => i > idx && v === "");
        const focusIdx =
            nextEmpty !== -1 ? nextEmpty : Math.min(idx + 1, newValue.length - 1);
        inputsRef.current[focusIdx]?.focus();
    };

    const distributeDigits = (startIdx: number, digits: string) => {
        const onlyDigits = digits.replace(/\D/g, "");
        if (!onlyDigits) return;

        const newValue = [...value];
        let i = startIdx;
        for (const ch of onlyDigits) {
            if (i >= newValue.length) break;
            newValue[i] = ch;
            i++;
        }
        onChange(newValue);
        // Move focus to the next empty or the last field
        const nextEmpty = newValue.findIndex((v, idx) => idx >= i && v === "");
        const focusIdx =
            nextEmpty !== -1 ? nextEmpty : Math.min(i, newValue.length - 1);
        inputsRef.current[focusIdx]?.focus();
    };

    const handleChange = (idx: number, raw: string) => {
        // Handle single digit OR a burst of digits (e.g., mobile paste/autofill)
        const digits = raw.replace(/\D/g, "");
        if (digits.length === 0) {
            const newValue = [...value];
            newValue[idx] = "";
            onChange(newValue);
            return;
        }

        if (digits.length === 1) {
            const newValue = [...value];
            newValue[idx] = digits;
            setAndFocusNext(idx, newValue);
        } else {
            // If multiple digits typed/pasted into one field, fan them out
            distributeDigits(idx, digits);
        }
    };

    const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            if (value[idx]) {
                // Clear current digit first
                const newValue = [...value];
                newValue[idx] = "";
                onChange(newValue);
            } else if (idx > 0) {
                // Move back if current already empty
                inputsRef.current[idx - 1]?.focus();
            }
        } else if (e.key === "ArrowLeft" && idx > 0) {
            inputsRef.current[idx - 1]?.focus();
            e.preventDefault();
        } else if (e.key === "ArrowRight" && idx < value.length - 1) {
            inputsRef.current[idx + 1]?.focus();
            e.preventDefault();
        }
    };

    const handlePaste = (idx: number, e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text");
        distributeDigits(idx, text);
    };

    return (
        <div className={styles.otpInputs}>
            {value.map((digit, idx) => (
                <input
                    key={idx}
                    ref={el => void (inputsRef.current[idx] = el)}
                    id={`otp-${idx}`}
                    type="tel"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleChange(idx, e.target.value)}
                    onKeyDown={e => handleKeyDown(idx, e)}
                    onPaste={e => handlePaste(idx, e)}
                    className={styles.otpInput}
                    required
                    aria-label={`OTP digit ${idx + 1}`}
                />
            ))}
        </div>
    );
}