import { websiteSettings } from "../../src/config/website-settings";
import MainLayout from "../../src/components/layout/MainLayout";
import Section from "../../src/components/layout/Section";

export default function Tickets() {
  const ticketsOnSale = websiteSettings.conferenceTicketSaleOpened || websiteSettings.workshopTicketSaleOpened;
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <MainLayout>
      <div style={{ height: '130px' }}></div> {/* Header spacer */}
      
      <Section id="tickets" headerText="Tickets" extraClass="rocket4">
        {ticketsOnSale ? (
          <div className="container">
            <div className="row">
              <p>
                Bitbash is a two day conference with workshops on {formatDate(websiteSettings.preConWorkshopsDate)} and 
                50 minute talks on {formatDate(websiteSettings.conferenceDate)}. Have a look at our <a href="/agenda">agenda</a> for the full details.
              </p>
              <p>
                Please note that you need separate tickets for workshops and conference talks. All tickets are <em>100% free</em>.
              </p>
            </div>
            
            <div className="row">
              <div className="col-lg-6">
                <h3>Workshop Tickets</h3>
                {websiteSettings.workshopTicketSoldOut ? (
                  <p>Workshop tickets are sold out!</p>
                ) : (
                  <p>Workshop ticket registration form will be available soon.</p>
                )}
              </div>
              <div className="col-lg-6">
                <h3>Conference Tickets</h3>
                {websiteSettings.conferenceTicketSoldOut ? (
                  <p>Conference tickets are sold out!</p>
                ) : (
                  <p>Conference ticket registration form will be available soon.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="container text-center">
            <p>Ticket sales will open soon. Follow us on social media to be notified when tickets become available!</p>
          </div>
        )}
      </Section>
    </MainLayout>
  );
}