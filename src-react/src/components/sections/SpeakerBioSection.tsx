import React from "react";
import Section from "../layout/Section";
import styles from "./SpeakerBioSection.module.css";

interface SpeakerBioSectionProps {
    fullName: string;
    tagLine: string;
    profilePictureUrl: string;
    bio: string;
}

export default function SpeakerBioSection({ fullName, tagLine, profilePictureUrl, bio }: SpeakerBioSectionProps) {

    return (
        <Section headerText={fullName} sectionBackground={4}>
            <div className="container">
                <div className="row">
                    <div className="col-md-6 g-0">
                        <div className={styles.speakerPhoto}>
                            <img
                                src={`/${profilePictureUrl}`}
                                alt={`Photo of speaker ${fullName}`}
                                className={styles.speakerPhotoImg}
                            />
                        </div>
                    </div>
                    <div className="col-md-6 text-light mb-4">
                        <h2>{tagLine}</h2>
                        <p className="lead"
                            dangerouslySetInnerHTML={{
                                __html: (bio || "").replace(/\r\n|\n/g, "<br/>"),
                            }}
                        ></p>
                    </div>
                </div>
            </div>
        </Section >
    );
}
