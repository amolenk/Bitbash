'use client'

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdmittoError, getAvailability, Availability, getRegistration, isAfterRegistrationClosed, updateRegistration, getTicketSettings, TicketSettings, resendTicketEmail, classifyTicketSelectionsForUpdate, ticketOutcomeSearchParams, recoverFromTicketStateConflict } from "../../api/admitto";
import SpinningButton from "../common/SpinningButton";
import WorkshopsForm from "./WorkshopsForm";
import MainConferenceForm from "./MainConferenceForm";
import PersonalDetailsForm, { PersonalDetails } from "./PersonalDetailsForm";
import Link from "next/link";
import ErrorCard from "../common/ErrorCard";

interface UpdateRegistrationFormProps {
    registrationId: string;
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

export default function UpdateRegistrationForm({ registrationId }: UpdateRegistrationFormProps) {

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
    const [originallyConfirmedTicketTypeIds, setOriginallyConfirmedTicketTypeIds] = useState<string[]>([]);
    const [originallyWaitlistedTicketTypeIds, setOriginallyWaitlistedTicketTypeIds] = useState<string[]>([]);
    const [details, setDetails] = useState<PersonalDetails>(emptyDetails);
    const [originalDetails, setOriginalDetails] = useState<PersonalDetails>(emptyDetails);

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
                    const heldTicketTypeIds = [...registrationResult.tickets, ...waitlistedTicketTypeIds];

                    if (heldTicketTypeIds.length === 0) {
                        setLoadingError("No existing registration found with the provided link.");
                    } else {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmittingError("");

        try {
            const tickets = [...workshopSelections];
            if (conferenceSelection && ticketSettings?.mainConferenceTicketTypeId) {
                tickets.push(ticketSettings.mainConferenceTicketTypeId);
            }

            // Classify the selected ticket types for the update request.
            // Ticket types the attendee already held (confirmed or
            // waitlisted) keep that same classification even if their
            // public status has since shifted, so re-saving the form never
            // silently demotes or promotes an untouched selection — only a
            // newly added ticket type gets classified by its current
            // status, mirroring create's classification.
            const { registerTicketTypeIds, waitlistTicketTypeIds } = classifyTicketSelectionsForUpdate(
                availability, tickets, originallyConfirmedTicketTypeIds, originallyWaitlistedTicketTypeIds
            );

            // Admitto only sends a new ticket email when the ticket selection actually changes.
            const ticketsChanged = originalConferenceSelection !== conferenceSelection
                || !arraysEqual(originalWorkshopSelections, workshopSelections);

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
                    waitlistTicketTypeIds);
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
                    waitlistTicketTypeIds);
            }

            // The confirmed/waitlisted split is already known here, at
            // submit time, so the ticket type names for the confirmation
            // page's itemized lists are passed along via URL query params
            // rather than requiring that page to look anything up again.
            const params = ticketOutcomeSearchParams(availability, registerTicketTypeIds, waitlistTicketTypeIds);
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

    const isFormValid = () =>
        (formRef.current?.checkValidity() ?? false)
        && (conferenceSelection === true || workshopSelections.length > 0)
        && (originalConferenceSelection !== conferenceSelection
            || !arraysEqual(originalWorkshopSelections, workshopSelections)
            || JSON.stringify(details) !== JSON.stringify(originalDetails));

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
    if (availability && isAfterRegistrationClosed(availability)) {
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

                <MainConferenceForm
                    availability={availability}
                    conferenceDate={ticketSettings.conferenceDate}
                    mainConferenceTicketTypeId={ticketSettings.mainConferenceTicketTypeId}
                    conferenceSelection={conferenceSelection}
                    setConferenceSelection={setConferenceSelection}
                    disabled={submitting}
                    queuePosition={waitlistPositions[ticketSettings.mainConferenceTicketTypeId]}
                />

                <WorkshopsForm
                    availability={availability}
                    workshopsDate={ticketSettings.workshopsDate}
                    workshopSelections={workshopSelections}
                    setWorkshopSelections={setWorkshopSelections}
                    disabled={submitting}
                    queuePositions={waitlistPositions}
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
