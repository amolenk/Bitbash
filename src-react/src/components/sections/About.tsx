import { websiteSettings } from "../../config/website-settings";
import Section from "../layout/Section";
import Aftermovie from "./Aftermovie";
import Galleria from "./Galleria";
import styles from "./About.module.css";

export default function About() {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  const preConDate = formatDate(websiteSettings.preConWorkshopsDate);
  const conferenceDate = new Date(websiteSettings.conferenceDate).getDate();
  
  return (
    <Section id="about" headerText="About" extraClass="rocket1" fadeUp={true}>
      {websiteSettings.currentEditionPhotosPublished && (
        <>
          <Aftermovie edition={websiteSettings.currentEdition} />
          <Galleria edition={websiteSettings.currentEdition} />
        </>
      )}
      
      <div className={styles.center}>
        <p>Get ready for an exciting two-day event that will cover the latest Microsoft technologies and innovations. Whether you&apos;re interested in .NET, Azure, Data platforms or AI, Bitbash will let you take your skills to the next level!</p>
        <p>Inspiring community speakers will present you with insightful sessions, real-world experience, and compelling demonstrations.</p>
        <p>Bitbash is an in-person event that&apos;s <em>free to attend</em>. It&apos;s held on {preConDate}-{conferenceDate} at Info Support HQ in Veenendaal, The Netherlands.</p>
        <p>Don&apos;t miss out on this opportunity to learn and network with like-minded professionals. See you at the event!</p>
      </div>
    </Section>
  );
}