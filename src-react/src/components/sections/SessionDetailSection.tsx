import React from "react";
import SpeakerCard from "./SpeakerCard";

interface Speaker {
    Id: string;
    FullName: string;
    Bio: string;
    TagLine: string;
    ProfilePictureUrl: string;
}

interface Session {
    Id: string;
    Title: string;
    Description?: string;
    SessionFormat?: string;
    Level?: string;
    Room?: string;
    StartsAt?: string;
    EndsAt?: string;
    Speakers?: Speaker[];
}

function formatTimeLocation(session: Session) {
    if (session.StartsAt && session.EndsAt) {
        const starts = new Date(session.StartsAt);
        const ends = new Date(session.EndsAt);
        let result = `${starts.toLocaleDateString('en-US', { weekday: 'long', day: '2-digit', month: 'short' })} ${starts.getHours().toString().padStart(2, '0')}:${starts.getMinutes().toString().padStart(2, '0')} - ${ends.getHours().toString().padStart(2, '0')}:${ends.getMinutes().toString().padStart(2, '0')}`;
        if (session.Room) {
            result += ` - ${session.Room}`;
        }
        return result;
    }
    return '';
}

export default function SessionDetailSection({ session }: { session: Session }) {
    return (
        <div className="row">
            <div className="card p-0">
                {session.StartsAt && (
                    <div className="card-header pb-0">
                        <h2>{formatTimeLocation(session)}</h2>
                    </div>
                )}
                <div className="card-body">
                    <p className="mb-0" dangerouslySetInnerHTML={{ __html: (session.Description ?? '').replace(/\r\n/g, '<br/>') }} />
                </div>
                <div className="card-footer bg-transparent border-0">
                    {session.SessionFormat && (
                        <span className="badge bg-info rounded-pill m-1">{session.SessionFormat}</span>
                    )}
                    {session.Level && (
                        <span className="badge bg-secondary rounded-pill m-1">{session.Level}</span>
                    )}
                </div>
                <div className="card-footer d-flex justify-content-center">
                    {session.Speakers && session.Speakers.map(speaker => (
                        <SpeakerCard key={speaker.Id} speaker={speaker} />
                    ))}
                </div>
            </div>
        </div>
    );
}
