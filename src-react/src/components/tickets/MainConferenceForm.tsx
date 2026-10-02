'use client'

import { Availability, TicketTypeDto } from "@/src/api/admitto";
import { formatDate } from "@/src/utils/date-utils";
import { WAITLIST_EXPLANATION } from "./waitlistCopy";

// Whether the Yes/No main conference question is actually being presented
// to the attendee (as opposed to a static "fully booked" message with no
// inputs at all). Callers that gate form submission on an explicit Yes/No
// answer must only require one when this is true — otherwise an attendee
// who can't be shown the choice in the first place would be unable to
// register at all.
export function isMainConferenceSelectable(
    conferenceTicket: TicketTypeDto | undefined,
    wasOriginallyRegistered = false
): boolean {
    return !!conferenceTicket && !(conferenceTicket.status === "soldOut" && !wasOriginallyRegistered);
}

interface MainConferenceFormProps {
    availability: Availability | null;
    conferenceDate: string;
    mainConferenceTicketTypeId: string;
    conferenceSelection: boolean | null;
    setConferenceSelection: React.Dispatch<React.SetStateAction<boolean | null>>;
    disabled: boolean;
    // Only set on the edit form, for an attendee who currently holds an
    // active waitlist entry (rather than a confirmed ticket) for the main
    // conference ticket type.
    queuePosition?: number;
    // Only set on the edit form: whether the attendee already held the main
    // conference ticket type (confirmed or waitlisted) when the form
    // loaded. If the ticket type has since gone fully sold out, this keeps
    // the Yes/No controls available instead of collapsing to a static
    // sold-out message, so the attendee can toggle their own pick off and
    // back on within the same edit session.
    wasOriginallyRegistered?: boolean;
    // Only set on the edit form, when the attendee has applied a valid
    // coupon covering the main conference ticket type: `availability` is
    // expected to already report this ticket type's status as "available"
    // (see applyCouponToAvailability), so this only controls whether the
    // "Unlocked by Coupon" badge and explanation are shown.
    couponUnlocked?: boolean;
    couponOnlyTicketTypeIds?: string[];
}

export default function MainConferenceForm({ availability, conferenceDate, mainConferenceTicketTypeId, conferenceSelection, setConferenceSelection, disabled, queuePosition, wasOriginallyRegistered, couponUnlocked, couponOnlyTicketTypeIds }: MainConferenceFormProps) {

    const conferenceTicket = availability?.ticketTypes.find(t => t.id === mainConferenceTicketTypeId);
    const isWaitlist = conferenceTicket?.status === "waitlist";
    const isSoldOut = conferenceTicket?.status === "soldOut";
    const isCouponRestricted = couponOnlyTicketTypeIds !== undefined && !couponOnlyTicketTypeIds.includes(mainConferenceTicketTypeId);

    if (!isMainConferenceSelectable(conferenceTicket, wasOriginallyRegistered)) {
        return (
            <div className="card h-100 shadow-sm mt-3 mb-4">
                <div className="card-header text-center"><h3>Main Conference – {formatDate(new Date(conferenceDate))} <span className="badge bg-danger ms-2">Sold Out</span></h3></div>
                <div className="card-body text-start mx-5">
                    <p>The main conference is currently fully booked.</p>
                    {queuePosition !== undefined && (
                        <p className="text-info" data-testid="conference-queue-position">
                            Your current queue position: #{queuePosition}
                        </p>
                    )}
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
                    {isSoldOut && <span className="badge bg-danger ms-2">Sold Out</span>}
                    {couponUnlocked && <span className="badge bg-success ms-2">Unlocked by Coupon</span>}
                </h3>
            </div>
            <div className="card-body text-start mx-5">
                <p>Join us for an inspiring day packed with 50-minute break-out sessions, networking opportunities, and engaging discussions.</p>
                {isWaitlist && <p>{WAITLIST_EXPLANATION}</p>}
                {isSoldOut && <p>This is now fully sold out, but since you already hold a spot, you can keep it or give it up.</p>}
                {couponUnlocked && <p>Your coupon grants you a ticket for the main conference, even though it&apos;s otherwise full.</p>}
                {queuePosition !== undefined && (
                    <p className="text-info" data-testid="conference-queue-position">
                        Your current queue position: #{queuePosition}
                    </p>
                )}
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
                            disabled={disabled || isCouponRestricted}
                            onChange={() => {
                                setConferenceSelection(true);
                            }}
                        />
                        <label className="form-check-label" htmlFor="conferenceYes">
                            {isSoldOut ? "Yes, keep my spot" : isWaitlist ? "Yes, join the waitlist" : "Yes, I want to attend"}
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
                            disabled={disabled || (isCouponRestricted && conferenceSelection !== true)}
                            onChange={() => {
                                setConferenceSelection(false);
                            }}
                        />
                        <label className="form-check-label" htmlFor="conferenceNo">
                            {isSoldOut ? "No, give up my spot" : isWaitlist ? "No thanks" : "No, I do not want to attend the main conference"}
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
