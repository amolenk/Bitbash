import HubSpotForm from "@/src/HubSpotForm";
import MainLayout from "../../src/components/layout/MainLayout";
import Section from "@/src/components/layout/Section";

export const metadata = {
    title: "Event Updates | Bitbash"
};

export default async function EventUpdatesPage() {

    return (
        <MainLayout>

            <Section headerText="Event Updates" sectionBackground={4}>

                <div className="row justify-content-center center">
                    <div className="col-lg-8 text-light">
                        <p className="lead">Want to be the first to know about upcoming (free!) events from Info Support?</p>
                        <p>Sign up to receive updates straight to your inbox. Whether it’s Bitbash or other community events, we’ll keep you posted so you never miss out.</p>
                        <p>By subscribing to event updates, you agree to our <a href="https://www.infosupport.com/en/privacy-statement/" target="_blank" rel="noopener">privacy policy.</a></p>
                        <div className="mt-4">
                            <HubSpotForm />
                        </div>
                    </div>
                </div>
            </Section>

        </MainLayout>
    );
}