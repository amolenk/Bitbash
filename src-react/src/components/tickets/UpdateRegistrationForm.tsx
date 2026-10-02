'use client'

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdmittoError, getAvailability, Availability, getRegistration, isBeforeRegistrationOpen, isAfterRegistrationClosed, updateRegistration, getTicketSettings, TicketSettings, resendTicketEmail, classifyTicketSelectionsForUpdate, ticketOutcomeSearchParams, recoverFromTicketStateConflict, applyCouponToAvailability, CouponDetails, OfferedTicket } from "../../api/admitto";
import SpinningButton from "../common/SpinningButton";
import WorkshopsForm from "./WorkshopsForm";
import MainConferenceForm, { isMainConferenceSelectable } from "./MainConferenceForm";
import PersonalDetailsForm, { PersonalDetails } from "./PersonalDetailsForm";
import CouponRedemptionForm from "./CouponRedemptionForm";
import Link from "next/link";
import ErrorCard from "../common/ErrorCard";

interface UpdateRegistrationFormProps {
    registrationId: string;
    initialCouponCode?: string;
}

const emptyDetails: PersonalDetails = {
    firstName: "",
    lastName: "",
    attendeeType: "",
    organization: "",
    role: "",
    institute: "",
    studyProgram: "",
    graduationDate: ""
};

// Reconstruct the personal-details form state from Admitto's additionalDetails map.
// Students store institute/studyProgram under the shared organization/role keys.
function toPersonalDetails(firstName: string, lastName: string, additionalDetails: Record<string, string>): PersonalDetails {
    const attendeeType = additionalDetails["attendee-type"] || "";
    const organization = additionalDetails["organization"] || "";
    const role = additionalDetails["role"] || "";
    const graduationDate = additionalDetails["graduation-date"] || "";

    if (attendeeType === "student") {
        return { firstName, lastName, attendeeType: "student", institute: organization, studyProgram: role, graduationDate };
    }
    if (attendeeType === "professional") {
        return { firstName, lastName, attendeeType: "professional", organization, role };
    }
    return { firstName, lastName, attendeeType: "", organization, role, institute: "", studyProgram: "", graduationDate };
}

export default function UpdateRegistrationForm({ registrationId, initialCouponCode }: UpdateRegistrationFormProps) {

    const [loading, setLoading] = useState(true);
    const [loadingError, setLoadingError] = useState("");
    const [cancelled, setCancelled] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submittingError, setSubmittingError] = useState("");
    const [resendingTicketEmail, setResendingTicketEmail] = useState(false);
    const [resendTicketEmailMessage, setResendTicketEmailMessage] = useState("");
    const [resendTicketEmailError, setResendTicketEmailError] = useState("");
    const [availability, setAvailability] = useState<Availability | null>(null);
    const [ticketSettings, setTicketSettings] = useState<TicketSettings | null>(null);
    const [conferenceSelection, setConferenceSelection] = useState<boolean | null>(null);
    const [originalConferenceSelection, setOriginalConferenceSelection] = useState<boolean | null>(null);
    const [workshopSelections, setWorkshopSelections] = useState<string[]>([]);
    const [originalWorkshopSelections, setOriginalWorkshopSelections] = useState<string[]>([]);
    const [waitlistPositions, setWaitlistPositions] = useState<Record<string, number>>({});
    const [offeredTickets, setOfferedTickets] = useState<OfferedTicket[]>([]);
    const [originallyConfirmedTicketTypeIds, setOriginallyConfirmedTicketTypeIds] = useState<string[]>([]);
    const [originallyWaitlistedTicketTypeIds, setOriginallyWaitlistedTicketTypeIds] = useState<string[]>([]);
    const [details, setDetails] = useState<PersonalDetails>(emptyDetails);
    const [originalDetails, setOriginalDetails] = useState<PersonalDetails>(emptyDetails);
    const [couponCode, setCouponCode] = useState<string | null>(null);
    const [appliedCoupon, setAppliedCoupon] = useState<CouponDetails | null>(null);

    const formRef = useRef<HTMLFormElement>(null);
    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            try {
                const [availabilityResult, registrationResult, ticketSettingsResult] = await Promise.all([
                    getAvailability(),
                    getRegistration(registrationId),
                    getTicketSettings()
                ]);

                setAvailability(availabilityResult);
                setTicketSettings(ticketSettingsResult);

                if (registrationResult.status === "cancelled") {
                    setCancelled(true);
                } else {
                    // A registration the attendee currently holds is either
                    // confirmed or waitlisted per ticket type; both count as
                    // "held" for the purposes of initializing the form's
                    // selections (this is also what allows an attendee who is
                    // purely on a waitlist, holding no confirmed ticket at
                    // all, to still reach and use this edit form).
                    const waitlistedTicketTypeIds = registrationResult.waitlistedTickets.map(waitlisted => waitlisted.id);
                    const offeredTicketTypeIds = registrationResult.offeredTickets.map(offered => offered.id);
                    const heldTicketTypeIds = [...registrationResult.tickets, ...waitlistedTicketTypeIds, ...offeredTicketTypeIds];

                    if (heldTicketTypeIds.length === 0) {
                        setLoadingError("No existing registration found with the provided link.");
                    } else {
                        setOfferedTickets(registrationResult.offeredTickets);
                        // Set conferenceSelection based on whether the main conference ticket is currently held
                        const hasConferenceTicket = heldTicketTypeIds.includes(ticketSettingsResult.mainConferenceTicketTypeId);
                        setConferenceSelection(hasConferenceTicket);
                        setOriginalConferenceSelection(hasConferenceTicket);

                        // Set workshopSelections based on the currently held ticket types
                        const workshopTickets = heldTicketTypeIds.filter(t => t !== ticketSettingsResult.mainConferenceTicketTypeId);
                        setWorkshopSelections(workshopTickets);
                        setOriginalWorkshopSelections(workshopTickets);

                        setWaitlistPositions(
                            Object.fromEntries(registrationResult.waitlistedTickets.map(waitlisted => [waitlisted.id, waitlisted.position]))
                        );
                        setOriginallyConfirmedTicketTypeIds(registrationResult.tickets);
                        setOriginallyWaitlistedTicketTypeIds(waitlistedTicketTypeIds);

                        // Set personal details based on registrationResult
                        const personalDetails = toPersonalDetails(
                            registrationResult.firstName,
                            registrationResult.lastName,
                            registrationResult.additionalDetails || {}
                        );
                        setDetails(personalDetails);
                        setOriginalDetails(personalDetails);
                    }
                }

                setLoading(false);
            } catch (err: unknown) {
                setLoadingError(err instanceof Error ? err.message : "Could not fetch ticket availability.");
                setLoading(false);
            }
        }
        fetchData();
    }, [registrationId]);

    // Ticket types a redeemed coupon covers are treated as "available" for
    // this attendee's own selection, regardless of their real public
    // status — this is what lets a VIP coupon unlock a ticket type that's
    // otherwise sold out or waitlist-only. Everything downstream (the
    // Main Conference/Workshops forms' selectability, and this form's own
    // confirmed/waitlisted classification at submit time) is driven off
    // this effective availability rather than the raw fetched one.
    const couponAllowedTicketTypeIds = appliedCoupon?.allowedTicketTypes.map(t => t.id) ?? [];
    const publicRegistrationClosed = !ticketSettings?.registrationOpen
        || !!(availability && (isBeforeRegistrationOpen(availability) || isAfterRegistrationClosed(availability)));
    const couponOnlySelection = publicRegistrationClosed && !!appliedCoupon;
    const effectiveAvailability = applyCouponToAvailability(availability, couponAllowedTicketTypeIds, couponOnlySelection);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmittingError("");

        try {
            const tickets = [...workshopSelections];
            if (conferenceSelection && ticketSettings?.mainConferenceTicketTypeId) {
                tickets.push(ticketSettings.mainConferenceTicketTypeId);
            }
            const couponCodeForSubmission = couponCode && tickets.some(id => couponAllowedTicketTypeIds.includes(id))
                ? couponCode
                : undefined;

            // Classify the selected ticket types for the update request.
            // Ticket types the attendee already held (confirmed or
            // waitlisted) keep that same classification even if their
            // public status has since shifted, so re-saving the form never
            // silently demotes or promotes an untouched selection — only a
            // newly added ticket type gets classified by its current
            // status, mirroring create's classification. A ticket type a
            // redeemed coupon covers is classified as confirmed (never
            // waitlisted), since the effective availability already
            // reports it as "available".
            const { registerTicketTypeIds, waitlistTicketTypeIds } = classifyTicketSelectionsForUpdate(
                effectiveAvailability, tickets, originallyConfirmedTicketTypeIds, originallyWaitlistedTicketTypeIds, couponAllowedTicketTypeIds
            );

            const couponConfirmsWaitlistedTicket = couponAllowedTicketTypeIds.some(id =>
                originallyWaitlistedTicketTypeIds.includes(id) && tickets.includes(id)
            );
            const couponConfirmsOfferedTicket = couponAllowedTicketTypeIds.some(id =>
                offeredTickets.some(offered => offered.id === id) && tickets.includes(id)
            );

            // Admitto sends a ticket email when a coupon confirms a held
            // waitlist entry, even if the attendee did not change a control.
            const ticketsChanged = originalConferenceSelection !== conferenceSelection
                || !arraysEqual(originalWorkshopSelections, workshopSelections)
                || couponConfirmsWaitlistedTicket
                || couponConfirmsOfferedTicket;

            if (details.attendeeType === "student") {
                await updateRegistration(
                    registrationId,
                    details.firstName,
                    details.lastName,
                    details.attendeeType,
                    details.institute,
                    details.studyProgram,
                    details.graduationDate,
                    registerTicketTypeIds,
                    waitlistTicketTypeIds,
                    couponCodeForSubmission);
            } else {
                await updateRegistration(
                    registrationId,
                    details.firstName,
                    details.lastName,
                    details.attendeeType,
                    details.organization,
                    details.role,
                    "",
                    registerTicketTypeIds,
                    waitlistTicketTypeIds,
                    couponCodeForSubmission);
            }

            // The confirmed/waitlisted split is already known here, at
            // submit time, so the ticket type names for the confirmation
            // page's itemized lists are passed along via URL query params
            // rather than requiring that page to look anything up again.
            const params = ticketOutcomeSearchParams(effectiveAvailability, registerTicketTypeIds, waitlistTicketTypeIds);
            params.set("ticketsChanged", String(ticketsChanged));

            router.push(`/tickets/register/updated?${params.toString()}`);
        } catch (err: unknown) {
            if (err instanceof AdmittoError && err.code === "registration.ticket_state_conflict") {
                await recoverFromTicketStateConflict({
                    setConferenceSelection,
                    setWorkshopSelections,
                    setAvailability,
                    setSubmittingError,
                    setLoadingError,
                    setSubmitting
                });
            } else {
                setSubmitting(false);
                setSubmittingError(err instanceof Error ? err.message : "Registration update failed. Please try again.");
            }
        }
    };

    const handleResendTicketEmail = async () => {
        setResendingTicketEmail(true);
        setResendTicketEmailMessage("");
        setResendTicketEmailError("");

        try {
            await resendTicketEmail(registrationId);
            setResendTicketEmailMessage("Your ticket email has been resent. Please check your inbox.");
        } catch (err: unknown) {
            setResendTicketEmailError(err instanceof Error ? err.message : "Could not resend your ticket email. Please try again.");
        } finally {
            setResendingTicketEmail(false);
        }
    };

    // Helper to compare arrays (order-insensitive)
    function arraysEqual(a: string[], b: string[]) {
        if (a.length !== b.length) return false;
        const aSorted = [...a].sort();
        const bSorted = [...b].sort();
        return aSorted.every((val, idx) => val === bSorted[idx]);
    }

    const conferenceTicket = effectiveAvailability?.ticketTypes.find(t => t.id === ticketSettings?.mainConferenceTicketTypeId);
    const mainConferenceSelectable = isMainConferenceSelectable(conferenceTicket, originalConferenceSelection === true);
    const selectedTicketTypeIds = [
        ...workshopSelections,
        ...(conferenceSelection && ticketSettings ? [ticketSettings.mainConferenceTicketTypeId] : [])
    ];
    const selectedOfferedTicketTypeIds = selectedTicketTypeIds.filter(id => offeredTickets.some(offered => offered.id === id));
    const selectedOffersAreUnlocked = !initialCouponCode
        || selectedOfferedTicketTypeIds.every(id => couponAllowedTicketTypeIds.includes(id));
    const offeredTicketNames = offeredTickets
        .map(offered => availability?.ticketTypes.find(ticketType => ticketType.id === offered.id)?.name)
        .filter((name): name is string => !!name);

    const isFormValid = () =>
        (formRef.current?.checkValidity() ?? false)
        && (!publicRegistrationClosed || !!appliedCoupon)
        && (!mainConferenceSelectable || conferenceSelection !== null)
        && (conferenceSelection === true || workshopSelections.length > 0)
        && selectedOffersAreUnlocked
        && (originalConferenceSelection !== conferenceSelection
            || !arraysEqual(originalWorkshopSelections, workshopSelections)
            || JSON.stringify(details) !== JSON.stringify(originalDetails)
            || couponAllowedTicketTypeIds.some(id => selectedTicketTypeIds.includes(id)));

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

    // Registration was already cancelled
    if (cancelled) {
        return (
            <div className="card h-100 shadow-sm">
                <div className="card-header text-center"><h3>Registration Cancelled</h3></div>
                <div className="card-body text-center">This registration has already been cancelled and can no longer be updated.</div>
            </div>
        );
    }

    // Registration already closed
    if (publicRegistrationClosed && !initialCouponCode) {
        return (
            <div className="card h-100 shadow-sm">
                <div className="card-header text-center"><h3>Registration is closed</h3></div>
                <div className="card-body text-center">Registration for this event has closed. See you next time!</div>
            </div>
        );
    }

    // Update form
    return (
        <div className="mx-auto">
            <form ref={formRef} onSubmit={handleSubmit} className="ticket-form">

                {offeredTickets.length > 0 && (
                    <div className="alert alert-info" data-testid="outstanding-offer">
                        A spot has been reserved for {offeredTicketNames.join(", ") || "your selected ticket"}. Use the coupon link from your offer email to confirm it.
                    </div>
                )}

                <CouponRedemptionForm
                    appliedCoupon={appliedCoupon}
                    onApply={(code, coupon) => {
                        setCouponCode(code);
                        setAppliedCoupon(coupon);
                    }}
                    onClear={() => {
                        setCouponCode(null);
                        setAppliedCoupon(null);
                    }}
                    initialCouponCode={initialCouponCode}
                    confirmationTicketNames={couponAllowedTicketTypeIds
                        .filter(id => originallyWaitlistedTicketTypeIds.includes(id) || offeredTickets.some(offered => offered.id === id))
                        .filter(id => workshopSelections.includes(id)
                            || (conferenceSelection && id === ticketSettings.mainConferenceTicketTypeId))
                        .map(id => availability?.ticketTypes.find(ticketType => ticketType.id === id)?.name)
                        .filter((name): name is string => !!name)}
                />

                <MainConferenceForm
                    availability={effectiveAvailability}
                    conferenceDate={ticketSettings.conferenceDate}
                    mainConferenceTicketTypeId={ticketSettings.mainConferenceTicketTypeId}
                    conferenceSelection={conferenceSelection}
                    setConferenceSelection={setConferenceSelection}
                    disabled={submitting || (publicRegistrationClosed && !appliedCoupon)}
                    queuePosition={waitlistPositions[ticketSettings.mainConferenceTicketTypeId]}
                    wasOriginallyRegistered={originalConferenceSelection === true}
                    couponUnlocked={couponAllowedTicketTypeIds.includes(ticketSettings.mainConferenceTicketTypeId)}
                    couponOnlyTicketTypeIds={couponOnlySelection ? couponAllowedTicketTypeIds : undefined}
                />

                <WorkshopsForm
                    availability={effectiveAvailability}
                    workshopsDate={ticketSettings.workshopsDate}
                    workshopSelections={workshopSelections}
                    setWorkshopSelections={setWorkshopSelections}
                    disabled={submitting || (publicRegistrationClosed && !appliedCoupon)}
                    queuePositions={waitlistPositions}
                    originalWorkshopSelections={originalWorkshopSelections}
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
                        {resendTicketEmailMessage && <div className="mt-2">{resendTicketEmailMessage}</div>}
                        {resendTicketEmailError && <div className="text-danger mt-2">{resendTicketEmailError}</div>}

                        <div className="text-center">
                            <SpinningButton loading={submitting} disabled={!isFormValid()} className="mt-2 me-3">
                                Update Registration
                            </SpinningButton>
                            <SpinningButton loading={resendingTicketEmail} type="button" disabled={submitting} className="mt-2 me-3" onClick={handleResendTicketEmail}>
                                Resend Ticket Email
                            </SpinningButton>
                            <Link href={`/tickets/cancel/${registrationId}`} className="btn btn-danger mt-2">
                                Cancel Registration
                            </Link>
                        </div>

                    </div>
                </PersonalDetailsForm>

            </form>
        </div>
    );
}
