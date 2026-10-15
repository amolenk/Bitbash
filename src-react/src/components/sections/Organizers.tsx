import Image, { type StaticImageData } from "next/image";
import Section from "../layout/Section";
import styles from "./Organizers.module.css";
import thomasPhoto from "@/public/img/organizers/thomas.jpg";
import sanderPhoto from "@/public/img/organizers/sander.jpg";
import tomPhoto from "@/public/img/organizers/tom.jpg";
import edwinPhoto from "@/public/img/organizers/edwin.jpg";
import sigridPhoto from "@/public/img/organizers/sigrid.jpg";
import yaelPhoto from "@/public/img/organizers/yael.jpg";

interface Organizer {
  name: string;
  image: StaticImageData;
}

export default function Organizers() {
  const organizers: Organizer[] = [
    { name: "Thomas de Klerk", image: thomasPhoto },
    { name: "Sander Molenkamp", image: sanderPhoto },
    { name: "Tom van den Berg", image: tomPhoto },
    { name: "Edwin van Wijk", image: edwinPhoto },
    { name: "Sigrid van Tuil-Oosting", image: sigridPhoto },
    { name: "Yael Bakker", image: yaelPhoto },
  ];

  return (
    <Section id="organizers" headerText="Organizers" fadeUp={true} extraClass="justify-content-center text-center my-4">
      <div className="row">
        {organizers.slice(0, 3).map((organizer, index) => (
          <div key={index} className={`col ${styles.organizerItem} text-center`}>
            <p className="text-light">
              <span className={styles.organizer}>
                <Image src={organizer.image} width={70} height={70} alt={organizer.name} />
              </span>
              {organizer.name}
            </p>
          </div>
        ))}
      </div>
      <div className="row">
        {organizers.slice(3).map((organizer, index) => (
          <div key={index} className={`col ${styles.organizerItem} text-center`}>
            <p className="text-light">
              <span className={styles.organizer}>
                <Image src={organizer.image} width={70} height={70} alt={organizer.name} />
              </span>
              {organizer.name}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}