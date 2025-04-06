"use client";

import { TablePageMode } from "@/types/TablePageMode";
import { useTranslation } from "react-i18next";
import { coursesHubPrefix } from "@/helpers/prefixes";
import { PageLayoutHeader } from "@/components/PageLayout/PageLayoutHeader/PageLayoutHeader";
import { FiniteSelector } from "@/components/FiniteSelector/FiniteSelector";
import { useState } from "react";
import styles from "./LessonItem.module.css";
import { useIcon } from "@/hooks/useIcon";
import { VideoUpload } from "@/components/Video/VideoUpload/VideoUpload";

export const LessonItem = ({ mode }: { mode: TablePageMode }) => {
    const { t } = useTranslation();
    const isEditMode = mode === TablePageMode.EDIT;
    const [withVideo, setWithVideo] = useState<boolean>(true);
    const checkIcon = useIcon('check');

    const videoSelectorOptions = [
        {
            value: true,
            label: t(`${coursesHubPrefix}.with-video`)
        },
        {
            value: false,
            label: t(`${coursesHubPrefix}.without-video`)
        }
    ]

    return (
        <>
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
                        mode='border'
                        icon={checkIcon}
                    />
                ))}
            </div>
            {withVideo && <VideoUpload />}
        </>
    );
};

