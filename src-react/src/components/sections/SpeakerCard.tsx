import React from "react";
import styles from "./SpeakerCard.module.css";
import { websiteSettings } from "../../config/website-settings";

interface Speaker {
  Id: string;
  FullName: string;
  Bio: string;
  TagLine: string;
  ProfilePictureUrl: string;
}

export default function SpeakerCard({ speaker }: { speaker: Speaker }) {
  const edition = websiteSettings.currentEdition;
  const url = `/${edition.slug}/speaker/${speaker.Id}`;
  return (
    <div
      className={`${styles.card} speaker bg-transparent border-0`}
      onClick={() => (window.location.href = url)}
    >
      <div className="text-center">
        <div className={styles.speakerPhoto}>
          <img
            loading="lazy"
            src={`/${speaker.ProfilePictureUrl}`}
            alt={`Photo of ${speaker.FullName}`}
            className={styles.speakerPhotoImg}
          />
        </div>
        <h3 className={styles.speakerName}>{speaker.FullName}</h3>
        <p className={`${styles.speakerTagline}`}>{speaker.TagLine}</p>
      </div>
    </div>
  );
}
