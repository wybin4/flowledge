import { usePrivateSetting } from "@/private-settings/hooks/usePrivateSetting";
import { useState, useCallback, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import styles from "./VideoUpload.module.css";
import { useIcon } from "@/hooks/useIcon";
import cn from "classnames";
import { getFileSize } from "@/helpers/getFileSize";
import { FileLoader } from "@/components/Loader/FileLoader/FileLoader";

export const VideoUpload = ({ childrenOnVideo }: { childrenOnVideo?: ReactNode }) => {
    const { t } = useTranslation();

    const videoIcon = useIcon('video');
    const videoUploadIcon = useIcon('video-upload');
    const videoUploadBorderIcon = useIcon('video-upload-border');

    const videoFileExtensionsString = usePrivateSetting<string>('file-upload.video');
    const fileUploadMaxSize = usePrivateSetting<number>('file-upload.max-size') || 104857600;

    const getAllowedFormats = useCallback(() => {
        const allowedFileExtensions = videoFileExtensionsString?.split(',').map(f => f.trim()) || [];
        return {
            allowedFileExtensions,
            acceptedMimeTypes: allowedFileExtensions.map(f => `video/${f}`).join(',')
        };
    }, [videoFileExtensionsString]);

    const { allowedFileExtensions, acceptedMimeTypes } = getAllowedFormats();

    const [video, setVideo] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [isUploaded, setIsUploaded] = useState<boolean>(false);
    const [isUploadError, setIsUploadError] = useState<boolean>(false);

    const handleVideoUpload = async (file: File) => {
        if (!file) return;

        const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';

        if (!allowedFileExtensions.includes(fileExtension)) {
            setIsUploadError(true);
            return;
        }

        if (file.size > fileUploadMaxSize) {
            setIsUploadError(true);
            return;
        }

        try {
            setVideo(file);
            setIsUploading(true);
            setIsUploadError(false);

            // Эмуляция загрузки на сервер
            const formData = new FormData();
            formData.append('video', file);

            // await axios.post('/api/upload-video', formData, {
            //     headers: {
            //         'Content-Type': 'multipart/form-data'
            //     }
            // });

            // setIsUploaded(true);
        } catch (error) {
            setIsUploadError(true);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className={styles.container}>
            {!video &&
                <label className={cn(
                    styles.uploadContainer,
                    isUploadError && styles.error
                )}>
                    <input
                        type="file"
                        accept={acceptedMimeTypes}
                        onChange={(e) => e.target.files?.[0] && handleVideoUpload(e.target.files[0])}
                        className={styles.hiddenInput}
                        disabled={isUploading}
                    />

                    <div className={styles.borderContainer}>{videoUploadBorderIcon}</div>
                    <div className={styles.icon}>{videoUploadIcon}</div>
                    <div className={styles.titleContainer}>
                        <div className={styles.title}>{t('video-upload.placeholder')}</div>
                        <div className={styles.description}>{t('video-upload.formats')} {allowedFileExtensions.join(', ')}</div>
                    </div>
                    {isUploading && <div className={styles.status}>{t('video-upload.uploading')}</div>}
                </label>
            }
            {isUploadError &&
                <div className={styles.errorMessage}>
                    {t('file-upload.size.error', { size: getFileSize(fileUploadMaxSize) })}
                </div>
            }
            {video && (
                <>
                    <div className={styles.video}>
                        <div className={styles.videoContainer}>
                            {videoIcon}
                            <div className={styles.videoInfoContainer}>
                                <div className={styles.videoName}>{video.name}</div>
                                <div className={styles.videoInfo}>
                                    {getFileSize(video.size)} - {t('video-upload.uploading')} 45%...
                                </div>
                            </div>
                        </div>
                        <FileLoader />
                    </div>
                    {childrenOnVideo}
                </>
            )}
        </div>
    );
};
