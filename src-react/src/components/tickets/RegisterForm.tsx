'use client'

import React, { useRef, useState, useEffect } from "react";

import ErrorCard from "../common/ErrorCard";
import MainConferenceForm from "./MainConferenceForm";
import PersonalDetailsForm, { PersonalDetails } from "./PersonalDetailsForm";
import SpinningButton from "../common/SpinningButton";
import WorkshopsForm from "./WorkshopsForm";

import { AdmittoError, getAvailability, Availability, isBeforeRegistrationOpen, isAfterRegistrationClosed, register } from "../../api/admitto";
import { websiteSettings } from "@/src/config/website-settings";
import router, { useRouter } from "next/navigation";

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
    const [conferenceSelection, setConferenceSelection] = useState<boolean | null>(null);
    const [workshopSelections, setWorkshopSelections] = useState<string[]>([]);
    const [details, setDetails] = useState<PersonalDetails>({
        firstName: "",
        lastName: "",
        attendeeType: null as any, // Must be chosen in form
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
                const availabilityResult = await getAvailability();
                setAvailability(availabilityResult);
                setLoading(false);
            } catch (err: any) {
                setLoadingError(err.message || "Could not fetch ticket availability.");
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // Redirect if email or token is missing
    useEffect(() => {
        if (email === "" || token === "") {
            router.push("/tickets/register/expired");
        }
    }, [email, token, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmittingError("");

        try {
            const tickets = [...workshopSelections];
            if (conferenceSelection) {
                tickets.push(websiteSettings.admitto.mainConferenceTicketSlug);
            }

            if (details.attendeeType === "student") {
                await register(
                    email,
                    details.firstName,
                    details.lastName,
                    details.attendeeType,
                    details.institute,
                    details.studyProgram,
                    details.graduationDate,
                    tickets,
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
                    tickets,
                    token);
            }

            router.push("/tickets/register/thankyou");
        } catch (err: any) {
            if (err instanceof AdmittoError && err.code === "attendee.invalid_token") {
                router.push("/tickets/register/expired");
            }
            else {
                setSubmitting(false);
                setSubmittingError(err.message || "Registration failed. Please try again.");
            }
        }
    };

    const isFormValid = () =>
        (formRef.current?.checkValidity() ?? false)
        && (conferenceSelection === true || workshopSelections.length > 0);

    // Loading spinner
    if (loading || email === "" || token === "") {
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
    if (!websiteSettings.currentEdition.registration.isOpen()) {
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