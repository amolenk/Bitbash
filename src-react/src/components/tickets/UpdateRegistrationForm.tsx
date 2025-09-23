'use client'

import React, { useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAvailability, Availability, register, getTickets, isRegistrationOpen, isAfterRegistrationClosed, changeTickets } from "../../api/admitto";
import SpinningButton from "../common/SpinningButton";
import { websiteSettings } from "@/src/config/website-settings";
import WorkshopsForm from "./WorkshopsForm";
import MainConferenceForm from "./MainConferenceForm";
import PersonalDetailsForm from "./PersonalDetailsForm";
import Link from "next/link";
import ErrorCard from "../common/ErrorCard";

interface UpdateRegistrationFormProps {
    publicId: string;
    signature: string;
}

export default function UpdateRegistrationForm({ publicId, signature }: UpdateRegistrationFormProps) {

    const [loading, setLoading] = useState(true);
    const [loadingError, setLoadingError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submittingError, setSubmittingError] = useState("");
    const [availability, setAvailability] = useState<Availability | null>(null);
    const [conferenceSelection, setConferenceSelection] = useState<boolean | null>(null);
    const [originalConferenceSelection, setOriginalConferenceSelection] = useState<boolean | null>(null);
    const [workshopSelections, setWorkshopSelections] = useState<string[]>([]);
    const [originalWorkshopSelections, setOriginalWorkshopSelections] = useState<string[]>([]);

    const router = useRouter();
    const params = useSearchParams();

    const conferenceTicketSlug = websiteSettings.admitto.mainConferenceTicketSlug;

    useEffect(() => {
        async function fetchData() {
            try {
                const [availabilityResult, ticketsResult] = await Promise.all([
                    getAvailability(),
                    getTickets(publicId, signature)
                ]);

                // If we have existing tickets, ensure those ticket types have hasCapacity=true
                if (ticketsResult && ticketsResult.tickets.length > 0 && availabilityResult.ticketTypes) {
                    ticketsResult.tickets.forEach(existingTicketSlug => {
                        const ticketType = availabilityResult.ticketTypes.find(t => t.slug === existingTicketSlug);
                        if (ticketType && ticketType.hasCapacity === false) {
                            ticketType.hasCapacity = true;
                        }
                    });
                }

                setAvailability(availabilityResult);

                if (ticketsResult && ticketsResult.tickets?.length > 0) {

                    // Set conferenceSelection based on whether main conference ticket is in ticketsResult
                    setConferenceSelection(ticketsResult.tickets.includes(conferenceTicketSlug));
                    setOriginalConferenceSelection(ticketsResult.tickets.includes(conferenceTicketSlug));

                    // Set workshopSelections based on ticketsResult
                    const workshopTickets = ticketsResult.tickets.filter(t => t !== conferenceTicketSlug);
                    setWorkshopSelections(workshopTickets);
                    setOriginalWorkshopSelections(workshopTickets);
                } else {
                    setLoadingError("No existing registration found with the provided link.");
                }

                setLoading(false);
            } catch (err: any) {
                setLoadingError(err.message || "Could not fetch ticket availability.");
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
            if (conferenceSelection) {
                tickets.push(websiteSettings.admitto.mainConferenceTicketSlug);
            }

            await changeTickets(publicId, signature, tickets);

            router.push("/tickets/register/thankyou");
        } catch (err: any) {
            setSubmitting(false);
            setSubmittingError(err.message || "Registration update failed. Please try again.");
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
        (conferenceSelection === true || workshopSelections.length > 0)
        && (originalConferenceSelection !== conferenceSelection
            || !arraysEqual(originalWorkshopSelections, workshopSelections));

    // Loading spinner
    if (loading) {
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
            <form onSubmit={handleSubmit} className="ticket-form">

                <MainConferenceForm
                    availability={availability}
                    conferenceSelection={conferenceSelection}
                    setConferenceSelection={setConferenceSelection}
                    disabled={submitting}
                />

                <WorkshopsForm
                    availability={availability}
                    workshopSelections={workshopSelections}
                    setWorkshopSelections={setWorkshopSelections}
                    disabled={submitting}
                />

                <div className="text-center text-light mt-3">
                    {submittingError && <div className="text-danger mt-2">{submittingError}</div>}

                    <div className="text-center">
                        <Link href={`/tickets/cancel/${publicId}/${signature}`} className="btn btn-danger mt-2 me-3">
                            Cancel Registration
                        </Link>
                        <SpinningButton loading={submitting} disabled={!isFormValid()} className="mt-2">
                            Update Registration
                        </SpinningButton>
                    </div>

                </div>

            </form>
        </div>
    );
}