'use client'

import React, { useEffect, useRef, useState } from "react";
import { AdmittoError, CouponDetails, lookupCoupon } from "../../api/admitto";
import SpinningButton from "../common/SpinningButton";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface CouponRedemptionFormProps {
    appliedCoupon: CouponDetails | null;
    onApply: (code: string, details: CouponDetails) => void;
    onRemove: () => void;
    disabled: boolean;
    initialCouponCode?: string;
    confirmationTicketNames?: string[];
}

// Lets an attendee redeem a coupon (e.g. a VIP invitation) that bypasses
// capacity for a specific set of ticket types — typically ones that are
// otherwise sold out or waitlist-only.
// Looking the code up here only validates and previews it: the coupon is
// actually redeemed by the parent form passing its code along with the
// next registration submission.
export default function CouponRedemptionForm({ appliedCoupon, onApply, onRemove, disabled, initialCouponCode, confirmationTicketNames = [] }: CouponRedemptionFormProps) {
    const [code, setCode] = useState(initialCouponCode ?? "");
    const [checking, setChecking] = useState(false);
    const [error, setError] = useState("");
    const hasAutomaticallyApplied = useRef(false);

    const applyCoupon = async (candidate: string) => {
        const trimmed = candidate.trim();
        if (!trimmed) return;

        if (!UUID_PATTERN.test(trimmed)) {
            setError("That doesn't look like a valid coupon code. Please check and try again.");
            return;
        }

        setChecking(true);
        setError("");

        try {
            const coupon = await lookupCoupon(trimmed);

            if (coupon.status === "redeemed") {
                setError("This coupon has already been used.");
            } else if (coupon.status === "expired") {
                setError("This coupon has expired.");
            } else {
                onApply(trimmed, coupon);
            }
        } catch (err: unknown) {
            setError(err instanceof AdmittoError && err.code === "coupon.not_found"
                ? "We couldn't find a coupon with that code. Please check and try again."
                : err instanceof Error ? err.message : "Could not check that coupon. Please try again.");
        } finally {
            setChecking(false);
        }
    };

    const handleApply = () => void applyCoupon(code);

    useEffect(() => {
        if (!initialCouponCode || hasAutomaticallyApplied.current) return;

        hasAutomaticallyApplied.current = true;
        const trimmed = initialCouponCode.trim();
        if (!UUID_PATTERN.test(trimmed)) {
            setError("That doesn't look like a valid coupon code. Please check and try again.");
            return;
        }

        async function applyInitialCoupon() {
            setChecking(true);
            setError("");

            try {
                const coupon = await lookupCoupon(trimmed);
                if (coupon.status === "redeemed") {
                    setError("This coupon has already been used.");
                } else if (coupon.status === "expired") {
                    setError("This coupon has expired.");
                } else {
                    onApply(trimmed, coupon);
                }
            } catch (err: unknown) {
                setError(err instanceof AdmittoError && err.code === "coupon.not_found"
                    ? "We couldn't find a coupon with that code. Please check and try again."
                    : err instanceof Error ? err.message : "Could not check that coupon. Please try again.");
            } finally {
                setChecking(false);
            }
        }

        void applyInitialCoupon();
    }, [initialCouponCode, onApply]);

    const handleRemove = () => {
        setCode("");
        setError("");
        onRemove();
    };

    return (
        <div className="card h-100 shadow-sm mt-3 mb-4">
            <div className="card-header text-center"><h3>Have a Coupon?</h3></div>
            <div className="card-body text-start mx-5">
                <p>
                    If you&apos;ve received a coupon — for example a VIP invitation for a ticket type that&apos;s
                    otherwise fully booked or waitlist-only — enter the code below to unlock it for your own selection.
                </p>

                <div className="d-flex gap-2 flex-wrap">
                    <input
                        type="text"
                        className="form-control"
                        style={{ maxWidth: "24rem" }}
                        placeholder="Coupon code"
                        aria-label="Coupon code"
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        disabled={disabled || checking}
                        readOnly={!!appliedCoupon}
                    />
                    {!appliedCoupon && (
                        <SpinningButton
                            type="button"
                            loading={checking}
                            disabled={disabled || !code.trim()}
                            onClick={handleApply}
                        >
                            Apply Coupon
                        </SpinningButton>
                    )}
                </div>

                {appliedCoupon ? (
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                        <div>
                            <div className="text-success" data-testid="coupon-applied-message">
                                Coupon applied — unlocks: {appliedCoupon.allowedTicketTypes.map(t => t.name).join(", ") || "no ticket types"}
                            </div>
                            {confirmationTicketNames.length > 0 && (
                                <div className="text-info mt-2" data-testid="coupon-waitlist-confirmation-message">
                                    When you submit this update, your waitlisted ticket{confirmationTicketNames.length === 1 ? "" : "s"} will be confirmed: {confirmationTicketNames.join(", ")}.
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={handleRemove}
                            disabled={disabled}
                        >
                            Remove Coupon
                        </button>
                    </div>
                ) : null}

                {error && <div className="text-danger mt-2" data-testid="coupon-error">{error}</div>}
            </div>
        </div>
    );
}
