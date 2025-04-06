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
import { InputBox } from "@/components/InputBox/InputBox";
import { ToggleSwitch } from "@/components/ToggleSwitch/ToggleSwitch";

export const LessonItem = ({ mode }: { mode: TablePageMode }) => {
    const { t } = useTranslation();
    const isEditMode = mode === TablePageMode.EDIT;
    const [withVideo, setWithVideo] = useState<boolean>(true);
    const checkIcon = useIcon('check');

    const [videoActions, setVideoActions] = useState<{ label: string, value: boolean, dependsOn?: string }[]>([
        { label: 'generate-synopsis', value: true },
        { label: 'generate-survey', value: true, dependsOn: 'generate-synopsis' },
    ]);

    const toggleVideoAction = (label: string) => {
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
    };

    const videoSelectorOptions = [
        {
            value: true,
            label: t(`${coursesHubPrefix}.with-video`)
        },
        {
            value: false,
            label: t(`${coursesHubPrefix}.without-video`)
        }
    ];

    const isDisabled = (action: { dependsOn?: string }) => {
        return action.dependsOn ? !videoActions.find(a => a.label === action.dependsOn)?.value : false;
    };

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
            {withVideo && <>
                <VideoUpload childrenOnVideo={
                    <div className={styles.videoActions}>
                        <h3>{t(`${coursesHubPrefix}.what-to-do-with-video`)}</h3>
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
                } />

            </>}
        </>
    );
};

