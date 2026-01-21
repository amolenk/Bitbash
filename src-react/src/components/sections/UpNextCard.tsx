import {SessionWithSpeakers} from "@/src/lib/sessionize";
import React from "react";
import styles from "./UpNextCard.module.css";

export default function UpNextCard({session}: { session: SessionWithSpeakers }) {

    return (

        <div
            className={`${styles.upNextCard} card h-100 w-100`}
        >
            <div className="card-header text-muted pb-0"><h2>{session.Room}</h2></div>
            <div className={`${styles.cardBody} card-body`}>
                <h3 className={`${styles.cardTitle} mb-4`}>{session.Title}</h3>
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
