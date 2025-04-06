import { getFileSize } from "@/helpers/getFileSize";
import { FileLoader } from "@/components/Loader/FileLoader/FileLoader";
import styles from "./VideoPreview.module.css";
import { useTranslation } from "react-i18next";
import { useIcon } from "@/hooks/useIcon";

type VideoPreviewProps = {
    name: string;
    size: number;
    isUploading: boolean;
    progress: number;
};

export const VideoPreview = ({ name, size, isUploading, progress }: VideoPreviewProps) => {
    const { t } = useTranslation();
    const videoIcon = useIcon('video');

    return (
        <div className={styles.video}>
            <div className={styles.videoContainer}>
                {videoIcon}
                <div className={styles.videoInfoContainer}>
                    <div className={styles.videoName}>{name}</div>
                    <div className={styles.videoInfo}>
                        {getFileSize(size)}{isUploading ? `- ${t('video-upload.uploading')} ${progress}%...` : ''}
                    </div>
                </div>
            </div>
            {isUploading && <FileLoader />}
        </div>
    );
};
