'use client'

import { Availability } from "@/src/api/admitto";
import { formatDate } from "@/src/utils/date-utils";
import { WAITLIST_EXPLANATION } from "./waitlistCopy";

interface MainConferenceFormProps {
    availability: Availability | null;
    conferenceDate: string;
    mainConferenceTicketTypeId: string;
    conferenceSelection: boolean | null;
    setConferenceSelection: React.Dispatch<React.SetStateAction<boolean | null>>;
    disabled: boolean;
}

export default function MainConferenceForm({ availability, conferenceDate, mainConferenceTicketTypeId, conferenceSelection, setConferenceSelection, disabled }: MainConferenceFormProps) {

    const conferenceTicket = availability?.ticketTypes.find(t => t.id === mainConferenceTicketTypeId);
    const isWaitlist = conferenceTicket?.status === "waitlist";

    if (!conferenceTicket || conferenceTicket.status === "soldOut") {
        return (
            <div className="card h-100 shadow-sm mt-3 mb-4">
                <div className="card-header text-center"><h3>Main Conference – {formatDate(new Date(conferenceDate))} <span className="badge bg-danger ms-2">Sold Out</span></h3></div>
                <div className="card-body text-start mx-5">
                    <p>The main conference is currently fully booked.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card h-100 shadow-sm mt-3 mb-4">
            <div className="card-header text-center">
                <h3>
                    Main Conference – {formatDate(new Date(conferenceDate))}
                    {isWaitlist && <span className="badge bg-warning text-dark ms-2">Waitlist Open</span>}
                </h3>
            </div>
            <div className="card-body text-start mx-5">
                <p>Join us for an inspiring day packed with 50-minute break-out sessions, networking opportunities, and engaging discussions.</p>
                {isWaitlist && <p>{WAITLIST_EXPLANATION}</p>}
                <p>Please indicate if you want to attend the main conference on <strong>Saturday</strong><span className="text-danger">*</span>:</p>
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
                            {isWaitlist ? "Yes, join the waitlist" : "Yes, I want to attend"}
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
                            {isWaitlist ? "No thanks" : "No, I do not want to attend the main conference"}
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
