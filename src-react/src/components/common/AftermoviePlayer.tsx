import styles from "./AftermoviePlayer.module.css";

interface AftermoviePlayerProps {
    youtubeId: string;
}

export default function AftermoviePlayer({
    youtubeId,
}: AftermoviePlayerProps) {
    return (
        <iframe
            className={styles.aftermovie}
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
            title="Aftermovie"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share" 
        />);
}
