import { websiteSettings } from "../../config/website-settings";

export default function CallForPapers() {
    const callForPapers = websiteSettings.currentEdition.callForPapers;

    if (!callForPapers.isOpen() || !callForPapers.url) return null;

    return (
        <div className="row text-light text-center">
            <p className="lead text-light">Interested in speaking at Bitbash?</p>
            <a href={callForPapers.url} target="_blank" rel="noopener noreferrer" className="lead">
                Submit your proposal
            </a>
        </div>
    );
}
