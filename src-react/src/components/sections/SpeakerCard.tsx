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
  const url = `/${edition}/speaker/${speaker.Id}`;
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
        <h5 className={styles.speakerName}>{speaker.FullName}</h5>
        <h4 className={styles.speakerTagline}>{speaker.TagLine}</h4>
      </div>
    </div>
  );
}
