'use client'

import React from "react";
import Image from "next/image";
import { speakerPhotoSrc } from "@/src/lib/sessionize";
import Section from "../layout/Section";
import styles from "./SpeakerBioSection.module.css";
import { websiteSettings } from "@/src/config/website-settings";

interface SpeakerBioSectionProps {
    fullName: string;
    tagLine: string;
    profilePictureUrl: string;
    bio: string;
    edition?: string;
}

export default function SpeakerBioSection({ fullName, tagLine, profilePictureUrl, bio, edition }: SpeakerBioSectionProps) {

    edition ??= websiteSettings.currentEdition.slug;

    return (
        <Section headerText={fullName} sectionBackground={4}>
            <div className="container">
                <div className="row">
                    <div className="col-md-6 g-0">
                        <div className={styles.speakerPhoto}>
                            <Image
                                width={256}
                                height={256}
                                priority
                                src={speakerPhotoSrc(profilePictureUrl)}
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
