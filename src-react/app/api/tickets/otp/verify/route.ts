import { AdmittoPartnerError, admittoRequest, eventPath, toProblemResponse } from "@/src/lib/admitto.server";

interface VerifyOtpResponse {
    token: string;
}

interface ResolveRegistrationResponse {
    registrationId: string;
}

export async function POST(req: Request) {
    try {
        const { email, code } = await req.json();
        const verificationResult = await admittoRequest<VerifyOtpResponse>(eventPath("/otp/verify"), {
            method: "POST",
            body: { email, code }
        });

        const token = verificationResult?.token;

        if (!token) {
            throw new Error("Email verification succeeded, but Admitto did not return a verification token.");
        }

        let registrationId: string | undefined;
        try {
            const resolution = await admittoRequest<ResolveRegistrationResponse>(
                `${eventPath("/registrations/resolve")}?email=${encodeURIComponent(email)}`,
                { token }
            );
            registrationId = resolution?.registrationId;
        } catch (error) {
            if (!(error instanceof AdmittoPartnerError) || error.status !== 404) {
                throw error;
            }
        }

        return Response.json({
            registrationToken: token,
            registrationId,
            email
        });
    } catch (error) {
        return toProblemResponse(error);
    }
}
