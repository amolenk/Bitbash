'use client'

import React, { useRef, useState, useEffect } from "react";

import ErrorCard from "../common/ErrorCard";
import MainConferenceForm, { isMainConferenceSelectable } from "./MainConferenceForm";
import PersonalDetailsForm, { PersonalDetails } from "./PersonalDetailsForm";
import SpinningButton from "../common/SpinningButton";
import WorkshopsForm from "./WorkshopsForm";
import CouponRedemptionForm from "./CouponRedemptionForm";

import { AdmittoError, getAvailability, Availability, isBeforeRegistrationOpen, isAfterRegistrationClosed, register, getTicketSettings, TicketSettings, splitTicketSelectionsByStatus, ticketOutcomeSearchParams, recoverFromTicketStateConflict, applyCouponToAvailability, CouponDetails } from "../../api/admitto";
import { useRouter } from "next/navigation";

interface RegisterFormProps {
    email: string;
    token: string;
    initialCouponCode?: string;
}

export default function RegisterForm({ email, token, initialCouponCode }: RegisterFormProps) {

    const [loading, setLoading] = useState(true);
    const [loadingError, setLoadingError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submittingError, setSubmittingError] = useState("");
    const [availability, setAvailability] = useState<Availability | null>(null);
    const [ticketSettings, setTicketSettings] = useState<TicketSettings | null>(null);
    const [conferenceSelection, setConferenceSelection] = useState<boolean | null>(null);
    const [workshopSelections, setWorkshopSelections] = useState<string[]>([]);
    const [couponCode, setCouponCode] = useState<string | null>(null);
    const [appliedCoupon, setAppliedCoupon] = useState<CouponDetails | null>(null);
    const [details, setDetails] = useState<PersonalDetails>({
        firstName: "",
        lastName: "",
        attendeeType: "",
        organization: "",
        role: "",
        institute: "",
        studyProgram: "",
        graduationDate: ""
    });
    
    const formRef = useRef<HTMLFormElement>(null);
    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            try {
                const [availabilityResult, ticketSettingsResult] = await Promise.all([
                    getAvailability(),
                    getTicketSettings()
                ]);
                setAvailability(availabilityResult);
                setTicketSettings(ticketSettingsResult);
                setLoading(false);
            } catch (err: unknown) {
                setLoadingError(err instanceof Error ? err.message : "Could not fetch ticket availability.");
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmittingError("");

        try {
            const tickets = [...workshopSelections];
            if (conferenceSelection && ticketSettings?.mainConferenceTicketTypeId) {
                tickets.push(ticketSettings.mainConferenceTicketTypeId);
            }

            // Split the selected ticket types into confirmed vs. waitlist
            // buckets based on each ticket type's current status, and send
            // both lists in the same single registration request. Coupon-
            // covered tickets have effective "available" status, so they
            // are submitted as confirmed registrations.
            const { registerTicketTypeIds, waitlistTicketTypeIds } = splitTicketSelectionsByStatus(effectiveAvailability, tickets);

            if (details.attendeeType === "student") {
                await register(
                    email,
                    details.firstName,
                    details.lastName,
                    details.attendeeType,
                    details.institute,
                    details.studyProgram,
                    details.graduationDate,
                    registerTicketTypeIds,
                    waitlistTicketTypeIds,
                    token,
                    couponCode ?? undefined);
            } else {
                await register(
                    email,
                    details.firstName,
                    details.lastName,
                    details.attendeeType,
                    details.organization,
                    details.role,
                    "",
                    registerTicketTypeIds,
                    waitlistTicketTypeIds,
                    token,
                    couponCode ?? undefined);
            }

            // The confirmed/waitlisted split is already known here, at submit
            // time, so the ticket type names for the confirmation page's
            // itemized lists are passed along via URL query params rather
            // than requiring the thank-you page to look anything up again.
            const params = ticketOutcomeSearchParams(effectiveAvailability, registerTicketTypeIds, waitlistTicketTypeIds);

            router.push(`/tickets/register/thankyou?${params.toString()}`);
        } catch (err: unknown) {
            if (err instanceof AdmittoError && err.code === "attendee.invalid_token") {
                router.push("/tickets/register/expired");
            }
            else if (err instanceof AdmittoError && err.code === "registration.ticket_state_conflict") {
                await recoverFromTicketStateConflict({
                    setConferenceSelection,
                    setWorkshopSelections,
                    setAvailability,
                    setSubmittingError,
                    setLoadingError,
                    setSubmitting
                });
            }
            else {
                setSubmitting(false);
                setSubmittingError(err instanceof Error ? err.message : "Registration failed. Please try again.");
            }
        }
    };

    // A valid coupon changes only the relevant ticket types for this
    // attendee; public availability remains unchanged for everyone else.
    const couponAllowedTicketTypeIds = appliedCoupon?.allowedTicketTypes.map(t => t.id) ?? [];
    const publicRegistrationClosed = !ticketSettings?.registrationOpen
        || !!(availability && (isBeforeRegistrationOpen(availability) || isAfterRegistrationClosed(availability)));
    const couponOnlySelection = publicRegistrationClosed && !!appliedCoupon;
    const effectiveAvailability = applyCouponToAvailability(availability, couponAllowedTicketTypeIds, couponOnlySelection);
    const conferenceTicket = effectiveAvailability?.ticketTypes.find(t => t.id === ticketSettings?.mainConferenceTicketTypeId);
    const mainConferenceSelectable = isMainConferenceSelectable(conferenceTicket);

    const isFormValid = () =>
        (formRef.current?.checkValidity() ?? false)
        && (!publicRegistrationClosed || !!appliedCoupon)
        && (!mainConferenceSelectable || conferenceSelection !== null)
        && (conferenceSelection === true || workshopSelections.length > 0);

    // Loading spinner
    if (loading || !ticketSettings) {
        return (
            <div className="d-flex justify-content-center align-items-center">
                <div className="spinner-border text-light" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    // Loading error
    if (loadingError) {
        return <ErrorCard error={loadingError} />;
    }

    // A coupon URL still needs to render its validator after public
    // registration closes; a valid coupon then unlocks only its own tickets.
    if (publicRegistrationClosed && !initialCouponCode) {
        return (
            <div className="card h-100 shadow-sm">
                <div className="card-header text-center"><h3>Registration is closed</h3></div>
                <div className="card-body text-center">Registration for this event has closed. See you next time!</div>
            </div>
        );
    }

    // Registration form
    return (
        <div className="mx-auto">
            <form ref={formRef} onSubmit={handleSubmit} className="ticket-form">

                <CouponRedemptionForm
                    appliedCoupon={appliedCoupon}
                    onApply={(code, coupon) => {
                        setCouponCode(code);
                        setAppliedCoupon(coupon);
                    }}
                    onRemove={() => {
                        setCouponCode(null);
                        setAppliedCoupon(null);
                    }}
                    disabled={submitting}
                    initialCouponCode={initialCouponCode}
                />

                <MainConferenceForm
                    availability={effectiveAvailability}
                    conferenceDate={ticketSettings.conferenceDate}
                    mainConferenceTicketTypeId={ticketSettings.mainConferenceTicketTypeId}
                    conferenceSelection={conferenceSelection}
                    setConferenceSelection={setConferenceSelection}
                    disabled={submitting || (publicRegistrationClosed && !appliedCoupon)}
                    couponUnlocked={couponAllowedTicketTypeIds.includes(ticketSettings.mainConferenceTicketTypeId)}
                    couponOnlyTicketTypeIds={couponOnlySelection ? couponAllowedTicketTypeIds : undefined}
                />

                <WorkshopsForm
                    availability={effectiveAvailability}
                    workshopsDate={ticketSettings.workshopsDate}
                    workshopSelections={workshopSelections}
                    setWorkshopSelections={setWorkshopSelections}
                    disabled={submitting || (publicRegistrationClosed && !appliedCoupon)}
                    couponUnlockedTicketTypeIds={couponAllowedTicketTypeIds}
                    couponOnlyTicketTypeIds={couponOnlySelection ? couponAllowedTicketTypeIds : undefined}
                />

                <PersonalDetailsForm
                    details={details}
                    setDetails={setDetails}
                    disabled={submitting}
                >
                    <div className="text-center text-light mt-3">
                        {submittingError && <div className="text-danger mt-2">{submittingError}</div>}

                        <div className="text-center">
                            <SpinningButton loading={submitting} disabled={!isFormValid()} className="mt-2">
                                Register
                            </SpinningButton>
                        </div>

                    </div>
                </PersonalDetailsForm>

            </form>
        </div>
    );
}
