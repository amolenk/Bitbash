import React from "react";
import SpeakerCard from "./SpeakerCard";
import styles from "./SessionDetail.module.css";

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
          <div className="card-header">
            <h2 className={styles.dateTime}>{formatTimeLocation(session)}</h2>
          </div>
        )}
        <div className={styles.cardBody}>
          <p dangerouslySetInnerHTML={{ __html: (session.Description ?? '').replace(/\r\n/g, '<br/>') }} />
          <h6>
            {session.SessionFormat && (
              <span className={styles.sessionFormat + " badge rounded-pill mt-2"}>{session.SessionFormat}</span>
            )}
            {session.Level && (
              <span className={styles.sessionLevel + " badge rounded-pill mt-2"}>{session.Level}</span>
            )}
          </h6>
        </div>
        <div className={`${styles.cardFooter} card-footer d-flex justify-content-center`}>
          {session.Speakers && session.Speakers.map(speaker => (
            <SpeakerCard key={speaker.Id} speaker={speaker} />
          ))}
        </div>
      </div>
    </div>
  );
}
