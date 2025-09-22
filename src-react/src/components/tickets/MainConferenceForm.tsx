'use client'

import { Availability, TicketTypeDto } from "@/src/api/admitto";
import { websiteSettings } from "@/src/config/website-settings";
import { formatDate } from "@/src/utils/date-utils";
import { useState, useEffect } from 'react';

interface MainConferenceFormProps {
    availability: Availability | null;
    conferenceSelection: boolean | null;
    setConferenceSelection: React.Dispatch<React.SetStateAction<boolean | null>>;
    disabled: boolean;
}

export default function MainConferenceForm({ availability, conferenceSelection, setConferenceSelection, disabled }: MainConferenceFormProps) {

    // const [selected, setSelected] = useState<boolean | null>(null);
    // const [choiceMade, setChoiceMade] = useState<boolean>(ticketSelections.includes('conference'));

    const edition = websiteSettings.currentEdition;

    const conferenceTicket = availability?.ticketTypes.find(t => t.slug === 'conference');

    // const initialSelection = isExistingRegistration
    //     ? (conferenceTicket && ticketSelections.includes(conferenceTicket.slug)) ?? null
    //     : null;

    // useEffect(() => {
    //     setSelected(initialSelection);
    // }, [initialSelection]);

    // For both existing and new registrations, check if the ticket is in the selections array

//    const isDisabled = conferenceTicket ? !conferenceTicket.hasCapacity || disabledTickets.has(conferenceTicket.slug) : true;

    if (conferenceTicket ? !conferenceTicket.hasCapacity : true) {
        return (
            <div className="card h-100 shadow-sm mt-3 mb-4">
                <div className="card-header text-center"><h3>Main Conference – {formatDate(edition.conferenceDate)} <span className="badge bg-danger ms-2">Sold Out</span></h3></div>
                <div className="card-body text-start mx-5">
                    <p>The main conference is currently fully booked.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card h-100 shadow-sm mt-3 mb-4">
            <div className="card-header text-center"><h3>Main Conference – {formatDate(edition.conferenceDate)}</h3></div>
            <div className="card-body text-start mx-5">
                <p>Join us for an inspiring day packed with 50-minute break-out sessions, networking opportunities, and engaging discussions.</p>
                <p>Please indicate if you want to attend the main conference on <strong>Saturday</strong><span className="text-danger">*</span>:</p>
                {conferenceTicket ? (
                    <div className="form-group mb-3">
                        <div className="form-check form-check-inline">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="conferenceAttendance"
                                id="conferenceYes"
                                value="yes"
                                checked={conferenceSelection === true}
                                disabled={disabled}
                                onChange={() => {
                                    setConferenceSelection(true);
                                }}
                            />
                            <label className="form-check-label" htmlFor="conferenceYes">
                                Yes, I want to attend
                                {!conferenceTicket.hasCapacity && <span className="badge bg-danger ms-2">Full</span>}
                            </label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="conferenceAttendance"
                                id="conferenceNo"
                                value="no"
                                checked={conferenceSelection === false}
                                disabled={disabled}
                                onChange={() => {
                                    setConferenceSelection(false);
                                }}
                            />
                            <label className="form-check-label" htmlFor="conferenceNo">
                                No, I do not want to attend the main conference
                            </label>
                        </div>
                    </div>
                ) : (
                    <div className="text-muted">No conference tickets available.</div>
                )}
            </div>
        </div>
    );
}