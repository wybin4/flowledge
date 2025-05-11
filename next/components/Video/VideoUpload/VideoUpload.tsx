import { usePrivateSetting } from "@/private-settings/hooks/usePrivateSetting";
import { useState, ReactNode, useMemo } from "react";
import { useTranslation } from "react-i18next";
import styles from "./VideoUpload.module.css";
import { useIcon } from "@/hooks/useIcon";
import cn from "classnames";
import { getFileSize } from "@/helpers/getFileSize";
import { VideoPreview } from "../VideoPreview/VideoPreview";
import { getAllowedFileFormats } from "@/helpers/getAllowedFileFormats";
import { uploadsPrefix } from "@/helpers/prefixes";

type VideoUploadProps = {
    isUploading: boolean;
    setIsUploading: (isUploading: boolean) => void;
    isUploadError: string | undefined;
    setIsUploadError: (isUploadError: string | undefined) => void;
    video: File | null;
    setVideo: (video: File | null) => void;
    childrenOnVideo?: ReactNode;
    maxSize: number;
    apiClientPrefix: string;
    setId: (videoId: string) => void;
    handleDelete: () => void;
};

type UploadedVideo = {
    fileId: string;
};

export const VideoUpload = ({
    video, setVideo, setId, handleDelete,
    isUploading, setIsUploading,
    isUploadError, setIsUploadError,
    childrenOnVideo, maxSize, apiClientPrefix
}: VideoUploadProps) => {
    const { t } = useTranslation();

    const [progress, setProgress] = useState<number>(0);

    const videoUploadIcon = useIcon('video-upload');
    const videoUploadBorderIcon = useIcon('video-upload-border');

    const videoFileExtensionsString = usePrivateSetting<string>('file-upload.video');

    const { allowedFileExtensions, acceptedMimeTypes } = useMemo(
        () => getAllowedFileFormats('video', videoFileExtensionsString),
        [videoFileExtensionsString]
    );

    const uploadVideo = async (file: File): Promise<UploadedVideo> => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${apiClientPrefix}/api/${uploadsPrefix}.set`, true);
            xhr.withCredentials = true;

            const formData = new FormData();
            formData.append('file', file);

            xhr.upload.onprogress = (event) => {
                if (!event.lengthComputable) {
                    return;
                }
                const progress = (event.loaded / event.total) * 100;
                if (progress === 100) {
                    return;
                }

                setProgress(Math.round(progress) || 0);
            };

            xhr.onerror = (error: any) => {
                setProgress(0);
                reject(new Error(error.message));
            };

            xhr.onload = async () => {
                if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                    const result = JSON.parse(xhr.responseText);
                    resolve(result);
                } else {
                    reject(new Error(xhr.responseText));
                }
            };

            xhr.send(formData);
        });
    };

    const handleVideoUpload = async (file: File) => {
        if (!file) return;

        const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';

        if (!allowedFileExtensions.includes(fileExtension)) {
            setIsUploadError(t('video-upload.unsupported-format'));
            return;
        }

        if (file.size > maxSize) {
            setIsUploadError(t('file-upload.size.error', { size: getFileSize(maxSize) }));
            return;
        }

        try {
            setVideo(file);
            setIsUploading(true);
            setIsUploadError(undefined);

            const video = await uploadVideo(file);
            setId(video.fileId);
            return;
        } catch (error: any) {
            setIsUploadError(t('video-upload.upload-error', { error: error.message }));
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className={styles.container}>
            {(!video || isUploadError) &&
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
                        <div className={styles.description}>
                            {t('video-upload.formats')} {videoFileExtensionsString}
                        </div>
                    </div>
                    {isUploading && <div className={styles.status}>{t('video-upload.uploading')}</div>}
                </label>
            }
            {isUploadError &&
                <div className={styles.errorMessage}>
                    {isUploadError}
                </div>
            }
            {video && !isUploadError && (
                <>
                    <VideoPreview
                        name={video.name}
                        size={video.size}
                        isUploading={isUploading}
                        progress={progress}
                        handleDelete={handleDelete}
                    />
                    {childrenOnVideo}
                </>
            )}
        </div>
    );
};
