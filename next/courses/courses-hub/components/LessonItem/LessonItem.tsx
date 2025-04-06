"use client";

import { TablePageMode } from "@/types/TablePageMode";
import { useTranslation } from "react-i18next";
import { coursesHubPrefix } from "@/helpers/prefixes";
import { PageLayoutHeader } from "@/components/PageLayout/PageLayoutHeader/PageLayoutHeader";
import { FiniteSelector } from "@/components/FiniteSelector/FiniteSelector";
import { useState, useCallback, useMemo } from "react";
import styles from "./LessonItem.module.css";
import { useIcon } from "@/hooks/useIcon";
import { VideoUpload } from "@/components/Video/VideoUpload/VideoUpload";
import { InputBox } from "@/components/InputBox/InputBox";
import { ToggleSwitch } from "@/components/ToggleSwitch/ToggleSwitch";
import { LessonItemHeader } from "./LessonItemHeader/LessonItemHeader";
import { usePrivateSetting } from "@/private-settings/hooks/usePrivateSetting";
import { getFileSize } from "@/helpers/getFileSize";
import { Button, ButtonType } from "@/components/Button/Button";
import { ButtonBackContainer } from "@/components/Button/ButtonBack/ButtonBackContainer";
import { FillBorderUnderlineMode } from "@/types/FillBorderUnderlineMode";
import { userApiClientPrefix } from "@/apiClient";

const initialVideoActions: VideoAction[] = [
    { label: 'generate-synopsis', value: true },
    { label: 'generate-survey', value: true, dependsOn: 'generate-synopsis' },
];

type VideoAction = {
    label: string;
    value: boolean;
    dependsOn?: string;
};

export const LessonItem = ({ mode }: { mode: TablePageMode }) => {
    const { t } = useTranslation();

    const [video, setVideo] = useState<File | null>(null);
    const [isVideoUploading, setIsVideoUploading] = useState<boolean>(false);
    const [isVideoUploadError, setIsVideoUploadError] = useState<string | undefined>(undefined);

    const [withVideo, setWithVideo] = useState<boolean>(true);
    const [videoActions, setVideoActions] = useState<VideoAction[]>(initialVideoActions);

    const fileUploadMaxSize = usePrivateSetting<number>('file-upload.max-size') || 104857600;

    const checkIcon = useIcon('check');
    const infoIcon = useIcon('info');
    const swapIcon = useIcon('swap');
    const videoUploadIcon = useIcon('video-upload');

    const isEditMode = mode === TablePageMode.EDIT;

    const toggleVideoAction = useCallback((label: string) => {
        setVideoActions(prev =>
            prev.map(action => {
                if (action.label === label) {
                    return { ...action, value: !action.value };
                }
                if (action.dependsOn === label) {
                    return { ...action, value: false };
                }
                return action;
            })
        );
    }, []);

    const videoSelectorOptions = useMemo(() => [
        {
            value: true,
            label: t(`${coursesHubPrefix}.with-video`)
        },
        {
            value: false,
            label: t(`${coursesHubPrefix}.without-video`)
        }
    ], [t]);

    const isDisabled = useCallback((action: { dependsOn?: string }) => {
        return action.dependsOn ? !videoActions.find(a => a.label === action.dependsOn)?.value : false;
    }, [videoActions]);

    const saveItem = useCallback(() => {
        console.log('saveItem');
    }, []);

    return (
        <ButtonBackContainer>
            <PageLayoutHeader
                name={isEditMode ? `${coursesHubPrefix}.edit-lesson` : `${coursesHubPrefix}.create-lesson`}
                translateName={false}
            />
            <div className={styles.videoSelector}>
                {videoSelectorOptions.map(option => (
                    <FiniteSelector
                        key={option.label}
                        value={option.value.toString()}
                        selectedValue={withVideo.toString()}
                        label={option.label}
                        onClick={() => setWithVideo(option.value)}
                        mode={FillBorderUnderlineMode.BORDER}
                        icon={checkIcon}
                    />
                ))}
            </div>
            {withVideo && <>
                <LessonItemHeader
                    title={t(`${coursesHubPrefix}.upload-video.name`)}
                    description={t(`${coursesHubPrefix}.upload-video.description`, {
                        size: getFileSize(fileUploadMaxSize)
                    })}
                    icon={videoUploadIcon}
                />
                <VideoUpload
                    isUploading={isVideoUploading}
                    setIsUploading={setIsVideoUploading}
                    isUploadError={isVideoUploadError}
                    setIsUploadError={setIsVideoUploadError}
                    video={video}
                    setVideo={setVideo}
                    maxSize={fileUploadMaxSize}
                    apiClientPrefix={userApiClientPrefix}
                    childrenOnVideo={
                        <>
                            <div className={styles.videoActions}>
                                <LessonItemHeader
                                    title={t(`${coursesHubPrefix}.what-to-do-with-video`)}
                                    icon={swapIcon}
                                />
                                {videoActions.map((action, index) => (
                                    <InputBox
                                        key={index}
                                        name={`${coursesHubPrefix}.${action.label}.name`}
                                        className={styles.videoAction}
                                        description={`${coursesHubPrefix}.${action.label}.description`}
                                    >
                                        <ToggleSwitch
                                            isChecked={action.value}
                                            onToggle={() => toggleVideoAction(action.label)}
                                            disabled={isDisabled(action)}
                                        />
                                    </InputBox>
                                ))}
                            </div>
                        </>
                    }
                />
            </>}
            <LessonItemHeader
                title={t(`${coursesHubPrefix}.what-else.name`)}
                description={t(`${coursesHubPrefix}.what-else.description`)}
                icon={infoIcon}
            />
            {!withVideo && <LessonItemHeader
                title={t(`${coursesHubPrefix}.you-can-add-video-later.name`)}
                icon={infoIcon}
            />}
            <div className={styles.buttonContainer}>
                <Button
                    onClick={saveItem}
                    prefix={coursesHubPrefix}
                    type={ButtonType.SAVE}
                    title={t('save-draft')}
                    disabled={!withVideo}
                    mode={FillBorderUnderlineMode.UNDERLINE}
                />
                <Button
                    onClick={saveItem}
                    prefix={coursesHubPrefix}
                    type={ButtonType.SAVE}
                    title={isEditMode ? t('save') : t('create')}
                    disabled={withVideo && (!video || !!isVideoUploadError || isVideoUploading)}
                />
            </div>
        </ButtonBackContainer>
    );
};
