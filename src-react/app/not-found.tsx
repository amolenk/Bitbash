import Section from "@/src/components/layout/Section";
import MainLayout from "@/src/components/layout/MainLayout";

export const metadata = {
    title: "Not Found | Bitbash"
};

export default function NotFoundPage() {
  return (
    <MainLayout>
        <Section headerText="Page Not Found" sectionBackground={2}>
            <div className="text-light text-center">
                <h2>Oops! We couldn't find that page.</h2>
            </div>
        </Section>
    </MainLayout>
  );
}
