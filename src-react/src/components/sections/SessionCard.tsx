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

export default function SessionCard({ session }: { session: Session }) {
  const edition = websiteSettings.currentEdition;
  const url = `/${edition}/session/${session.Id}`;

  if (session.IsServiceSession) {
    return (
      <div className={`${styles.serviceSessionCard} card`}>
        <div className={`${styles.cardBody} card-body`}>
          <h6 className="card-subtitle mb-2 text-muted">{session.Room}</h6>
          <h5 className={styles.cardTitle}>{session.Title}</h5>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.sessionCard} card`}
      onClick={() => (window.location.href = url)}
    >
      <div className={`${styles.cardBody} card-body`}>
        <h6 className="mb-2 text-muted">{session.Room}</h6>
        <h5 className={styles.cardTitle}>{session.Title}</h5>
        {session.Speakers && session.Speakers.map(speaker => (
          <h6 key={speaker.Id} className="mb-2 text-muted">
            <img
              loading="lazy"
              src={speaker.ProfilePictureUrl}
              className={styles.speakerPhoto}
              alt={`Photo of ${speaker.FullName}`}
            />
            {speaker.FullName}
          </h6>
        ))}
      </div>
      <div className={`${styles.cardFooter} card-footer`}>
        <h6>
          {session.SessionFormat && (
            <span className={styles.sessionFormat + " badge rounded-pill mt-2"}>{session.SessionFormat}</span>
          )}
          {session.Level && (
            <span className={styles.sessionLevel + " badge rounded-pill mt-2"}>{session.Level}</span>
          )}
        </h6>
      </div>
    </div>
  );
}
