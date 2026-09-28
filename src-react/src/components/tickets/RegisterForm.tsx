'use client'

import React, { useRef, useState, useEffect } from "react";

import ErrorCard from "../common/ErrorCard";
import MainConferenceForm from "./MainConferenceForm";
import PersonalDetailsForm, { PersonalDetails } from "./PersonalDetailsForm";
import SpinningButton from "../common/SpinningButton";
import WorkshopsForm from "./WorkshopsForm";

import { AdmittoError, getAvailability, Availability, isBeforeRegistrationOpen, isAfterRegistrationClosed, register, getTicketSettings, TicketSettings, splitTicketSelectionsByStatus } from "../../api/admitto";
import { useRouter } from "next/navigation";

interface RegisterFormProps {
    email: string;
    token: string;
}

export default function RegisterForm({ email, token }: RegisterFormProps) {

    const [loading, setLoading] = useState(true);
    const [loadingError, setLoadingError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submittingError, setSubmittingError] = useState("");
    const [availability, setAvailability] = useState<Availability | null>(null);
    const [ticketSettings, setTicketSettings] = useState<TicketSettings | null>(null);
    const [conferenceSelection, setConferenceSelection] = useState<boolean | null>(null);
    const [workshopSelections, setWorkshopSelections] = useState<string[]>([]);
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
            // both lists in the same single registration request.
            const { registerTicketTypeIds, waitlistTicketTypeIds } = splitTicketSelectionsByStatus(availability, tickets);

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
                    token);
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
                    token);
            }

            // The confirmed/waitlisted split is already known here, at submit
            // time, so the ticket type names for the confirmation page's
            // itemized lists are passed along via URL query params rather
            // than requiring the thank-you page to look anything up again.
            const params = new URLSearchParams();
            ticketTypeNames(registerTicketTypeIds).forEach(name => params.append("confirmed", name));
            ticketTypeNames(waitlistTicketTypeIds).forEach(name => params.append("waitlisted", name));

            router.push(`/tickets/register/thankyou?${params.toString()}`);
        } catch (err: unknown) {
            if (err instanceof AdmittoError && err.code === "attendee.invalid_token") {
                router.push("/tickets/register/expired");
            }
            else if (err instanceof AdmittoError && err.code === "registration.ticket_state_conflict") {
                await recoverFromTicketStateConflict();
            }
            else {
                setSubmitting(false);
                setSubmittingError(err instanceof Error ? err.message : "Registration failed. Please try again.");
            }
        }
    };

    const ticketTypeNames = (ticketTypeIds: string[]): string[] =>
        ticketTypeIds
            .map(id => availability?.ticketTypes.find(t => t.id === id)?.name)
            .filter((name): name is string => !!name);

    // Availability shifted between page load and submit: the backend
    // rejected the request because a ticket type's status no longer matches
    // what was classified client-side. Refetch fresh availability, clear the
    // conference/workshop selections back to unselected (personal details
    // are left untouched), and ask the attendee to review and reselect.
    const recoverFromTicketStateConflict = async () => {
        setConferenceSelection(null);
        setWorkshopSelections([]);

        try {
            setAvailability(await getAvailability());
            setSubmittingError("Ticket availability changed while you were completing this form. Please review and reselect your tickets, then submit again.");
        } catch {
            // The stale availability we already have is now known to be
            // wrong, and a retry would be classified against that same
            // stale data — so surface this as a distinct, more serious
            // failure rather than silently inviting another reselect.
            setLoadingError("Could not refresh ticket availability after your selection changed. Please reload the page and try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const isFormValid = () =>
        (formRef.current?.checkValidity() ?? false)
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

    // Registration not yet open in website
    if (!ticketSettings.registrationOpen) {
        return (
            // TODO Create reusable Card component
            <div className="card h-100 shadow-sm">
                <div className="card-header text-center"><h3>Registration is closed</h3></div>
                <div className="card-body text-center">Registration is not open yet. Please check back later.</div>
            </div>
        );
    }

    // Registration not yet open
    if (availability && isBeforeRegistrationOpen(availability)) {
        return (
            <div className="card h-100 shadow-sm">
                <div className="card-header text-center"><h3>Registration is closed</h3></div>
                <div className="card-body text-center">Registration is not open yet. Please check back later.</div>
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

    // Registration form
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
