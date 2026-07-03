'use client'

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAvailability, Availability, getRegistration, isAfterRegistrationClosed, updateRegistration, getTicketSettings, TicketSettings, resendTicketEmail } from "../../api/admitto";
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

                // If we have existing tickets, ensure those ticket types have hasCapacity=true
                if (registrationResult.tickets.length > 0 && availabilityResult.ticketTypes) {
                    registrationResult.tickets.forEach(existingTicketTypeId => {
                        const ticketType = availabilityResult.ticketTypes.find(t => t.id === existingTicketTypeId);
                        if (ticketType && ticketType.hasCapacity === false) {
                            ticketType.hasCapacity = true;
                        }
                    });
                }

                setAvailability(availabilityResult);
                setTicketSettings(ticketSettingsResult);

                if (registrationResult.status === "cancelled") {
                    setCancelled(true);
                } else if (registrationResult.tickets.length > 0) {

                    // Set conferenceSelection based on whether main conference ticket is in registrationResult
                    setConferenceSelection(registrationResult.tickets.includes(ticketSettingsResult.mainConferenceTicketTypeId));
                    setOriginalConferenceSelection(registrationResult.tickets.includes(ticketSettingsResult.mainConferenceTicketTypeId));

                    // Set workshopSelections based on registrationResult
                    const workshopTickets = registrationResult.tickets.filter(t => t !== ticketSettingsResult.mainConferenceTicketTypeId);
                    setWorkshopSelections(workshopTickets);
                    setOriginalWorkshopSelections(workshopTickets);

                    // Set personal details based on registrationResult
                    const personalDetails = toPersonalDetails(
                        registrationResult.firstName,
                        registrationResult.lastName,
                        registrationResult.additionalDetails || {}
                    );
                    setDetails(personalDetails);
                    setOriginalDetails(personalDetails);
                } else {
                    setLoadingError("No existing registration found with the provided link.");
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
                    tickets);
            } else {
                await updateRegistration(
                    registrationId,
                    details.firstName,
                    details.lastName,
                    details.attendeeType,
                    details.organization,
                    details.role,
                    "",
                    tickets);
            }

            router.push(`/tickets/register/updated?ticketsChanged=${ticketsChanged}`);
        } catch (err: unknown) {
            setSubmitting(false);
            setSubmittingError(err instanceof Error ? err.message : "Registration update failed. Please try again.");
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
                />

                <WorkshopsForm
                    availability={availability}
                    workshopsDate={ticketSettings.workshopsDate}
                    workshopSelections={workshopSelections}
                    setWorkshopSelections={setWorkshopSelections}
                    disabled={submitting}
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
