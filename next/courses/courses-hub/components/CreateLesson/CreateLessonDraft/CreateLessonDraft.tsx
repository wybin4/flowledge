"use client";

import { TablePageMode } from "@/types/TablePageMode";
import { useTranslation } from "react-i18next";
import { coursesHubLessonsPrefixApi, coursesHubLessonsPrefixTranslate, coursesHubPrefix } from "@/helpers/prefixes";
import { PageLayoutHeader } from "@/components/PageLayout/PageLayoutHeader/PageLayoutHeader";
import { FiniteSelector } from "@/components/FiniteSelector/FiniteSelector";
import { useState, useCallback, useMemo } from "react";
import styles from "./CreateLessonDraft.module.css";
import { useIcon } from "@/hooks/useIcon";
import { VideoUpload } from "@/components/Video/VideoUpload/VideoUpload";
import { InputBox } from "@/components/InputBox/InputBox";
import { ToggleSwitch } from "@/components/ToggleSwitch/ToggleSwitch";
import { CreateLessonDraftHeader } from "./CreateLessonDraftHeader/CreateLessonDraftHeader";
import { usePrivateSetting } from "@/private-settings/hooks/usePrivateSetting";
import { getFileSize } from "@/helpers/getFileSize";
import { Button, ButtonType } from "@/components/Button/Button";
import { ButtonBackContainer } from "@/components/Button/ButtonBack/ButtonBackContainer";
import { FillBorderUnderlineMode } from "@/types/FillBorderUnderlineMode";
import { integrationApiClient, neuralApiClient, userApiClient, userApiClientPrefix } from "@/apiClient";
import { SynopsisCreateResponse } from "../../../types/SynopsisCreateResponse";
import { SurveyCreateResponse } from "../../../types/SurveyCreateResponse";
import { LessonSaveType, LessonToSaveOnDraftRequest, LessonToSaveOnDraftResponse } from "../../../types/LessonToSave";
import { usePathname, useRouter } from "next/navigation";
import { SettingType, SettingValueType } from "@/types/Setting";
import { SettingWrapper } from "@/components/Settings/SettingWrapper/SettingWrapper";
import { UpdatableSetting } from "@/hooks/useSettings";

enum VideoActionType {
    Synopsis = 'generate-synopsis',
    Survey = 'generate-survey'
};

const initialVideoActions: VideoAction[] = [
    { label: VideoActionType.Synopsis, value: true },
    {
        label: VideoActionType.Survey,
        value: true,
        dependsOn: VideoActionType.Synopsis,
        options: {
            questions: 5
        }
    },
];

type VideoAction = {
    label: VideoActionType;
    value: boolean;
    dependsOn?: VideoActionType;
    options?: Record<string, SettingValueType>
};

type CreateLessonDraftProps = {
    mode: TablePageMode;
    sectionId: string;
}

export const CreateLessonDraft = ({ mode, sectionId }: CreateLessonDraftProps) => {
    const { t } = useTranslation();

    const [video, setVideo] = useState<File | null>(null);
    const [videoId, setVideoId] = useState<string | undefined>(undefined);
    const [isVideoUploading, setIsVideoUploading] = useState<boolean>(false);
    const [isVideoUploadError, setIsVideoUploadError] = useState<string | undefined>(undefined);

    const [withVideo, setWithVideo] = useState<boolean>(true);
    const [videoActions, setVideoActions] = useState<VideoAction[]>(initialVideoActions);

    const [loadingString, setLoadingString] = useState<string | undefined>(undefined);

    const router = useRouter();
    const currentPath = usePathname();

    const fileUploadMaxSize = usePrivateSetting<number>('file-upload.max-size') || 104857600;

    const saveLesson = (body?: LessonToSaveOnDraftRequest) =>
        userApiClient.post<LessonToSaveOnDraftResponse>(
            `${coursesHubLessonsPrefixApi}.create`, body
        );

    const checkIcon = useIcon('round-check');
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

    const setVideoActionOption = useCallback((label: string, key: string, value: SettingValueType) => {
        setVideoActions(prev =>
            prev.map(action => {
                if (action.label === label && action.options) {
                    return {
                        ...action,
                        options: {
                            ...action.options,
                            [key]: value
                        }
                    };
                }
                return action;
            })
        );
    }, []);

    const findInitialValue = useCallback((label: VideoActionType, key: string): SettingValueType | undefined => {
        const action = initialVideoActions.find(action => action.label === label);
        if (action && action.options) {
            return action.options[key];
        }
        return undefined;
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

    const onSaveVideo = async (videoId: string, createSurvey?: VideoAction) => {
        try {
            setLoadingString(`${coursesHubLessonsPrefixTranslate}.synopsis-loading`);
            const { synopsis } = await neuralApiClient.post<SynopsisCreateResponse>('synopsis.create', {
                fileId: videoId
            });

            if (!synopsis) {
                throw new Error('Не удалось получить конспект');
            }

            let survey: string | undefined = undefined;
            if (createSurvey && createSurvey.value) {
                setLoadingString(`${coursesHubLessonsPrefixTranslate}.survey-loading`);
                const { survey: surveyResult } = await integrationApiClient.post<SurveyCreateResponse>('survey.create', {
                    integration_id: "67e82f27f026b5eeb6f74713", // TODO
                    context: {
                        text: synopsis,
                        num_questions: 5
                    }
                });
                survey = surveyResult;
            }

            setLoadingString(undefined);

            return { survey, synopsis };
        } catch (error) {
            console.error('Ошибка при сохранении:', error);
            throw error;
        }
    };

    const onSave = useCallback(async (isDraft?: boolean) => {
        try {
            let lessonId: string | undefined;
            let synopsis: string | undefined, survey: string | undefined = undefined;
            const isVisible = false;

            if (withVideo && !isDraft) {
                if (!videoId) {
                    return;
                }

                const createSynopsis = videoActions.find(va => va.label === VideoActionType.Synopsis);
                const createSurvey = videoActions.find(va => va.label === VideoActionType.Survey);

                if (createSynopsis && createSynopsis.value) {
                    const result = await onSaveVideo(videoId, createSurvey);
                    synopsis = result.synopsis;
                    survey = result.survey;
                }
            }

            setLoadingString(`${coursesHubLessonsPrefixTranslate}.creating`);

            const result = await saveLesson({ 
                videoId, survey, synopsis, isVisible, sectionId,
                type: LessonSaveType.Draft
             });
            lessonId = result.lessonId;

            if (lessonId) {
                router.push(`${currentPath}/${lessonId}?details=true&hasVideo=${!!videoId}`)
            } else {
                console.error('Ошибка при сохранении');
            }
        } catch (error) {
            console.error('Ошибка при сохранении:', error);
            throw error;
        }
    }, [JSON.stringify(videoActions), videoId, currentPath, withVideo]);

    if (loadingString) {
        return <div>{t(loadingString)}</div>;
    }

    return (
        <ButtonBackContainer>
            <div className={styles.content}>
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
                    <CreateLessonDraftHeader
                        title={t(`${coursesHubPrefix}.upload-video.name`)}
                        description={t(`${coursesHubPrefix}.upload-video.description`, {
                            size: getFileSize(fileUploadMaxSize)
                        })}
                        icon={videoUploadIcon}
                    />
                    <VideoUpload
                        setId={setVideoId}
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
                                    <CreateLessonDraftHeader
                                        title={t(`${coursesHubPrefix}.what-to-do-with-video`)}
                                        icon={swapIcon}
                                    />
                                    {videoActions.map((action, index) => (
                                        <span key={index}>
                                            <InputBox
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
                                            {action.options && Object.keys(action.options).map(key => {
                                                if (action.options && action.options[key] != undefined) {
                                                    return (
                                                        <SettingWrapper
                                                            key={key}
                                                            className={styles.videoActionOption}
                                                            debounceTime={0}
                                                            setting={{
                                                                _id: key,
                                                                value: action.options[key],
                                                                packageValue: findInitialValue(action.label, key) || '',
                                                                i18nLabel: `${coursesHubPrefix}.${key}`,
                                                                type: typeof action.options[key] === 'string'
                                                                    ? SettingType.InputText
                                                                    : SettingType.InputNumber
                                                            }}
                                                            handleSave={({ value }: UpdatableSetting) => {
                                                                setVideoActionOption(action.label, key, value);
                                                            }}
                                                        />
                                                    );
                                                } else return null;
                                            })}
                                        </span>
                                    ))}
                                </div>
                            </>
                        }
                    />
                </>}
                {!videoId &&
                    <CreateLessonDraftHeader
                        title={t(`${coursesHubPrefix}.what-else.name`)}
                        description={t(`${coursesHubPrefix}.what-else.description`)}
                        icon={infoIcon}
                    />
                }
                {!withVideo &&
                    <CreateLessonDraftHeader
                        title={t(`${coursesHubPrefix}.you-can-add-video-later.name`)}
                        icon={infoIcon}
                    />
                }
            </div>
            <div className={styles.buttonContainer}>
                <Button
                    onClick={async () => {
                        await onSave(true);
                        router.back();
                    }}
                    prefix={coursesHubPrefix}
                    type={ButtonType.SAVE}
                    title={t('save-draft')}
                    disabled={!withVideo}
                    mode={FillBorderUnderlineMode.UNDERLINE}
                />
                <Button
                    onClick={() => onSave(false)}
                    prefix={coursesHubPrefix}
                    type={ButtonType.SAVE}
                    title={t('next')}
                    disabled={withVideo && (!video || !!isVideoUploadError || isVideoUploading || !videoId)}
                />
            </div>
        </ButtonBackContainer>
    );
};
