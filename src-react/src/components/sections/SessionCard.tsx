import React from "react";
import styles from "./SessionCard.module.css";
import { websiteSettings } from "../../config/website-settings";

interface Speaker {
    Id: string;
    FullName: string;
    ProfilePictureUrl: string;
}

interface Session {
    Id: string;
    Title: string;
    Room: string;
    IsServiceSession?: boolean;
    Speakers?: Speaker[];
    SessionFormat?: string;
    Level?: string;
}

export default function SessionCard({ session, edition }: { session: Session, edition?: string }) {

    edition ??= websiteSettings.currentEdition.slug;
    const url = `/${edition}/session/${session.Id}`;

    if (session.IsServiceSession) {
        return (
            <div className={`${styles.serviceSessionCard} card`}>
                <div className="card-header text-muted pb-0"><h6>{session.Room}</h6></div>
                <div className={`${styles.cardBody} card-body`}>
                    <h4 className={`${styles.cardTitle} my-0`}>{session.Title}</h4>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`${styles.sessionCard} card`}
            onClick={() => (window.location.href = url)}
        >
            <div className="card-header text-muted pb-0"><h6>{session.Room}</h6></div>
            <div className={`${styles.cardBody} card-body`}>
                <h4 className={`${styles.cardTitle} mb-4`}>{session.Title}</h4>
                {session.Speakers && session.Speakers.map(speaker => (
                    <p key={speaker.Id}>
                        <img
                            loading="lazy"
                            src={speaker.ProfilePictureUrl}
                            className={styles.speakerPhoto}
                            alt={`Photo of ${speaker.FullName}`}
                        />
                        {speaker.FullName}
                    </p>
                ))}
            </div>
            <div className="card-footer bg-transparent border-0">
                {session.SessionFormat && (
                    <span className="badge bg-info rounded-pill m-1">{session.SessionFormat}</span>
                )}
                {session.Level && (
                    <span className="badge bg-primary rounded-pill m-1">{session.Level}</span>
                )}
            </div>
        </div>
    );
}
