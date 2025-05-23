import { useRef, useState, useEffect, Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";

type VideoPlayerProps = {
    className?: string;
    src: string;
    poster?: string;
    setPercentWatched: (percent: number) => void;
};

export const VideoPlayer = ({
    src, poster,
    setPercentWatched,
    className
}: VideoPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [duration, setDuration] = useState<number>(0);
    const [watchedTime, setWatchedTime] = useState<number>(0);

    const { t } = useTranslation();

    useEffect(() => {
        const video = videoRef.current;

        if (!video) return;

        const handleLoadedMetadata = () => {
            setDuration(video.duration);
        };

        const handleTimeUpdate = () => {
            setWatchedTime(video.currentTime);
            const percent = (video.currentTime / video.duration) * 100;
            setPercentWatched(percent);
        };

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('timeupdate', handleTimeUpdate);

        return () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('timeupdate', handleTimeUpdate);
        };
    }, []);

    return (
        <video ref={videoRef} poster={poster} controls className={className}>
            <source src={src} type="video/mp4" />
            {t('browser-unsupported-video')}
        </video>
    );
};