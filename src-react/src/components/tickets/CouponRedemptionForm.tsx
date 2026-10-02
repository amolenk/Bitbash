'use client'

import { useEffect, useRef } from "react";
import { CouponDetails, lookupCoupon } from "../../api/admitto";

interface CouponRedemptionFormProps {
    onApply: (code: string, details: CouponDetails) => void;
    onClear: () => void;
    initialCouponCode?: string;
}

// Coupon URLs grant availability for particular ticket types. The code remains
// unredeemed until the attendee submits a selection that includes one of them.
export default function CouponRedemptionForm({ onApply, onClear, initialCouponCode }: CouponRedemptionFormProps) {
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
            try {
                const coupon = await lookupCoupon(trimmed);
                if (coupon.status === "active" && !cancelled) {
                    onApplyRef.current(trimmed, coupon);
                }
            } catch {
                // Invalid coupons leave all tickets in their normal state.
            }
        }

        void loadCoupon();

        return () => {
            cancelled = true;
        };
    }, [initialCouponCode]);

    return null;
}
