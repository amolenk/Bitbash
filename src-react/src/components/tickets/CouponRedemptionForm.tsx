'use client'

import React, { useEffect, useRef, useState } from "react";
import { AdmittoError, CouponDetails, lookupCoupon } from "../../api/admitto";

interface CouponRedemptionFormProps {
    appliedCoupon: CouponDetails | null;
    onApply: (code: string, details: CouponDetails) => void;
    onClear: () => void;
    initialCouponCode?: string;
    confirmationTicketNames?: string[];
}

// Coupon URLs grant availability for particular ticket types. The code remains
// unredeemed until the attendee submits a selection that includes one of them.
export default function CouponRedemptionForm({ appliedCoupon, onApply, onClear, initialCouponCode, confirmationTicketNames = [] }: CouponRedemptionFormProps) {
    const [checking, setChecking] = useState(false);
    const [error, setError] = useState("");
    const [canRetry, setCanRetry] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const onApplyRef = useRef(onApply);
    const onClearRef = useRef(onClear);

    useEffect(() => {
        onApplyRef.current = onApply;
    }, [onApply]);

    useEffect(() => {
        onClearRef.current = onClear;
    }, [onClear]);

    useEffect(() => {
        onClearRef.current();
        if (!initialCouponCode) return;

        const trimmed = initialCouponCode.trim();

        let cancelled = false;

        async function loadCoupon() {
            setChecking(true);
            setError("");
            setCanRetry(false);

            try {
                const coupon = await lookupCoupon(trimmed);
                if (coupon.status === "redeemed") {
                    if (!cancelled) setError("This coupon has already been used.");
                } else if (coupon.status === "expired") {
                    if (!cancelled) setError("This coupon has expired.");
                } else if (!cancelled) {
                    onApplyRef.current(trimmed, coupon);
                }
            } catch (err: unknown) {
                if (!cancelled) {
                    if (err instanceof AdmittoError && err.code === "coupon.not_found") {
                        setError("We couldn't find the coupon in this link.");
                    } else {
                        setError(err instanceof Error ? err.message : "Could not check the coupon in this link.");
                        setCanRetry(true);
                    }
                }
            } finally {
                if (!cancelled) setChecking(false);
            }
        }

        void loadCoupon();

        return () => {
            cancelled = true;
        };
    }, [initialCouponCode, retryCount]);

    if (!initialCouponCode) return null;

    return (
        <div className="card h-100 shadow-sm mt-3 mb-4">
            <div className="card-header text-center"><h3>Coupon</h3></div>
            <div className="card-body text-start mx-5">
                {appliedCoupon ? (
                    <div>
                        <div className="text-success" data-testid="coupon-applied-message">
                            This coupon unlocks: {appliedCoupon.allowedTicketTypes.map(t => t.name).join(", ") || "no ticket types"}
                        </div>
                        {confirmationTicketNames.length > 0 && (
                            <div className="text-info mt-2" data-testid="coupon-waitlist-confirmation-message">
                                When you submit this update, your waitlisted ticket{confirmationTicketNames.length === 1 ? "" : "s"} will be confirmed: {confirmationTicketNames.join(", ")}.
                            </div>
                        )}
                    </div>
                ) : null}

                {checking && <div className="text-muted" role="status">Checking coupon...</div>}
                {error && <div className="text-danger mt-2" role="alert" data-testid="coupon-error">{error}</div>}
                {canRetry && (
                    <button type="button" className="btn btn-outline-secondary btn-sm mt-2" onClick={() => setRetryCount(count => count + 1)}>
                        Retry
                    </button>
                )}
            </div>
        </div>
    );
}
