import { websiteSettings } from "../../config/website-settings";
import styles from "./Aftermovie.module.css";

interface AfterimovieProps {
  edition: string;
}

export default function Aftermovie({ edition }: AfterimovieProps) {
  const aftermovieUrl = websiteSettings.aftermovies[edition];
  
  if (!aftermovieUrl) return null;
  
  return (
    <div className="container">
      <div className="row justify-content-center p-2">
        <iframe 
          className={styles.aftermovie}
          src={aftermovieUrl}
          title="Bitbash Aftermovie" 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          referrerPolicy="strict-origin-when-cross-origin" 
          allowFullScreen
        />
      </div>
    </div>
  );
}