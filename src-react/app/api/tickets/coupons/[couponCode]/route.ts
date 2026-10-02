import { admittoRequest, eventPath, PublicCouponDetailsDto, toProblemResponse } from "@/src/lib/admitto.server";

// Public lookup of a coupon's redemption details (status, which ticket
// types it covers, and when it expires), so the self-service edit form can
// validate a coupon code and preview what it unlocks before the attendee
// submits an update that redeems it.
export async function GET(
    req: Request,
    context: { params: Promise<{ couponCode: string }> }
) {
    try {
        const { couponCode } = await context.params;

        const coupon = await admittoRequest<PublicCouponDetailsDto>(
            eventPath(`/coupons/${encodeURIComponent(couponCode)}`)
        );

        return Response.json(coupon);
    } catch (error) {
        return toProblemResponse(error);
    }
}
