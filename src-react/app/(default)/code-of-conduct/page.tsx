import Section from "@/src/components/layout/Section";
import {Metadata} from "next";
import MainLayout from "../../../src/components/layout/MainLayout";
import {websiteSettings} from "@/src/config/website-settings";

export const metadata: Metadata = {
    title: "Code of Conduct | Bitbash"
};

export default async function CodeOfConductPage() {

    const edition = websiteSettings.currentEdition;

    return (
        <MainLayout>
            <Section headerText="Code of Conduct" sectionBackground={2}>

                <p className="text-light lead">All attendees, speakers, sponsors and volunteers at Bitbash are required to agree with the following
                    code of conduct. Organisers will enforce this code throughout the event. We expect cooperation from
                    all participants to help ensure a safe environment for everybody.</p>

                <h2 className="text-light">The Quick Version</h2>

                <p className="text-light">Bitbash is dedicated to providing a harassment-free conference experience for everyone, regardless of
                    gender, gender identity and expression, age, sexual orientation, disability, physical appearance,
                    body size, race, ethnicity, religion (or lack thereof), or technology choices. We do not tolerate
                    harassment of conference participants in any form. Sexual language and imagery is not appropriate
                    for any conference venue, including talks, workshops, parties, Twitter and other online media.
                    Conference participants violating these rules may be sanctioned or expelled from the conference at
                    the discretion of the conference organisers.</p>

                <h2 className="text-light">The Less Quick Version</h2>

                <p className="text-light">Harassment includes offensive verbal comments related to gender, gender identity and expression, age,
                    sexual orientation, disability, physical appearance, body size, race, ethnicity, religion,
                    technology choices, sexual images in public spaces, deliberate intimidation, stalking, following,
                    harassing photography or recording, sustained disruption of talks or other events, inappropriate
                    physical contact, and unwelcome sexual attention.</p>

                <p className="text-light">Participants asked to stop any harassing behavior are expected to comply immediately.</p>

                <p className="text-light">Sponsors are also subject to the anti-harassment policy. In particular, sponsors should not use
                    sexualised images, activities, or other material. Booth staff (including volunteers) should not use
                    sexualised clothing/uniforms/costumes, or otherwise create a sexualised environment.</p>

                <p className="text-light">If a participant engages in harassing behavior, the conference organisers may take any action they
                    deem appropriate, including warning the offender or expulsion from the conference.</p>

                <p className="text-light">If you are being harassed, notice that someone else is being harassed, or have any other concerns,
                    please contact a member of conference staff immediately. Conference staff can be identified as
                    they&apos;ll be wearing Bitbash branded clothing.</p>

                <p className="text-light">Conference staff will be happy to help participants contact hotel/venue security or local law
                    enforcement, provide escorts, or otherwise assist those experiencing harassment to feel safe for the
                    duration of the conference. We value your attendance.</p>

                <p className="text-light">We expect participants to follow these rules at conference and workshop venues and conference-related
                    social events.</p>

                <p className="text-light">(Code of conduct based on <a href="https://confcodeofconduct.com/">Conference Code of Conduct</a>)
                </p>

                {edition.isCurrentlyTakingPlace() && (
                    <div className="text-light mb-4">
                        <h2>Contact Information</h2>
                        <p>If you need to report an incident or have any concerns during the event, please reach out to our
                            Code of Conduct team:</p>
                        <ul>
                            {edition.codeOfConduct.contacts.map((contact, i) =>
                                <li key={i}>{contact.name} - {contact.phoneNumber}</li>)}
                        </ul>
                    </div>
                )}

            </Section>
        </MainLayout>
    );
}