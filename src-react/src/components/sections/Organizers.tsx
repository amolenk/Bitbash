import Section from "../layout/Section";
import styles from "./Organizers.module.css";

interface Organizer {
  name: string;
  image: string;
}

export default function Organizers() {
  const organizers: Organizer[] = [
    { name: "Thomas de Klerk", image: "/img/organizers/thomas.jpg" },
    { name: "Sander Molenkamp", image: "/img/organizers/sander.jpg" },
    { name: "Tom van den Berg", image: "/img/organizers/tom.jpg" },
    { name: "Edwin van Wijk", image: "/img/organizers/edwin.jpg" },
    { name: "Sigrid van Tuil-Oosting", image: "/img/organizers/sigrid.jpg" },
  ];

  return (
    <Section id="organizers" headerText="Organizers" fadeUp={true} extraClass="justify-content-center text-center my-4">
      <div className="row">
        {organizers.slice(0, 2).map((organizer, index) => (
          <div key={index} className={`col ${styles.organizerItem} text-center`}>
            <p className="lead text-light">
              <span className={styles.organizer}>
                <img src={organizer.image} alt={organizer.name} />
              </span>
              {organizer.name}
            </p>
          </div>
        ))}
      </div>
      <div className="row">
        {organizers.slice(2).map((organizer, index) => (
          <div key={index} className={`col ${styles.organizerItem} text-center`}>
            <p className="lead text-light">
              <span className={styles.organizer}>
                <img src={organizer.image} alt={organizer.name} />
              </span>
              {organizer.name}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}