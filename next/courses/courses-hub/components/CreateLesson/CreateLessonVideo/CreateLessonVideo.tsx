"use client";

import { useTranslation } from "react-i18next";
import { coursesHubLessonsPrefixApi, coursesHubLessonsPrefixTranslate, coursesHubPrefix, uploadsPrefix } from "@/helpers/prefixes";
import { FiniteSelector } from "@/components/FiniteSelector/FiniteSelector";
import { useState, useCallback, useMemo, useEffect } from "react";
import styles from "./CreateLessonVideo.module.css";
import { useIcon } from "@/hooks/useIcon";
import { VideoUpload } from "@/components/Video/VideoUpload/VideoUpload";
import { InputBox } from "@/components/InputBox/InputBox";
import { ToggleSwitch } from "@/components/ToggleSwitch/ToggleSwitch";
import { CreateLessonVideoHeader } from "./CreateLessonVideoHeader/CreateLessonVideoHeader";
import { usePrivateSetting } from "@/private-settings/hooks/usePrivateSetting";
import { getFileSize } from "@/helpers/getFileSize";
import { Button, ButtonType } from "@/components/Button/Button";
import { FillBorderUnderlineMode } from "@/types/FillBorderUnderlineMode";
import { integrationApiClient, neuralApiClient, userApiClient, userApiClientPrefix } from "@/apiClient";
import { SynopsisCreateResponse } from "../../../dto/SynopsisCreateResponse";
import { SurveyCreateResponse } from "../../../dto/SurveyCreateResponse";
import { LessonAdditionalSaveType, LessonSaveType, LessonToSaveOnDraftRequest, LessonToSaveOnDraftResponse } from "../../../types/LessonToSave";
import { usePathname, useRouter } from "next/navigation";
import { SettingType, SettingValueType } from "@/types/Setting";
import { SettingWrapper } from "@/components/Settings/SettingWrapper/SettingWrapper";
import { UpdatableSetting } from "@/hooks/useSettings";
import { ButtonBackContainer } from "@/components/Button/ButtonBack/ButtonBackContainer";
import { ChildrenPosition } from "@/types/ChildrenPosition";
import { CreateLessonChildrenProps } from "../CreateLesson";
import { LessonGetByIdResponse } from "@/courses/courses-hub/dto/LessonGetByIdResponse";

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

interface CreateLessonVideoProps extends CreateLessonChildrenProps {
    videoId?: string;
}

export const CreateLessonVideo = ({ lessonId, setLesson, videoId: initialVideoId }: CreateLessonVideoProps) => {
    const { t } = useTranslation();

    useEffect(() => {
        const fetchVideo = async () => {
            if (initialVideoId) {
                try {
                    const response = await fetch(`${userApiClientPrefix}/api/${uploadsPrefix}.get/${initialVideoId}`, {
                        credentials: 'include',
                    });
                    if (!response.ok) {
                        throw new Error('File not found');
                    }
                    const contentDisposition = response.headers.get('Content-Disposition');
                    const filename = contentDisposition?.split('filename=')[1]?.replace(/['"]/g, '') || 'video.mp4';
                    const blob = await response.blob();
                    const file = new File([blob], filename, { type: blob.type });
                    setVideo(file);
                } catch (error) {
                    console.error('Error fetching video:', error);
                }
            }
        };

        fetchVideo();
    }, [initialVideoId]);

    const [removeVideo, setRemoveVideo] = useState<boolean>(false);
    const [video, setVideo] = useState<File | null>(null);
    const [videoId, setVideoId] = useState<string | undefined>(initialVideoId);
    const [isVideoUploading, setIsVideoUploading] = useState<boolean>(false);
    const [isVideoUploadError, setIsVideoUploadError] = useState<string | undefined>(undefined);

    const [withVideo, setWithVideo] = useState<boolean>(true);
    const [videoActions, setVideoActions] = useState<VideoAction[]>(initialVideoActions);

    const [loadingString, setLoadingString] = useState<string | undefined>(undefined);

    const router = useRouter();
    const currentPath = usePathname();

    const translationPrefix = coursesHubPrefix;

    const fileUploadMaxSize = usePrivateSetting<number>('file-upload.max-size') || 104857600;

    const saveLesson = (body?: LessonToSaveOnDraftRequest) =>
        userApiClient.post<LessonToSaveOnDraftResponse>(
            `${coursesHubLessonsPrefixApi}.create`, body
        );

    const checkIcon = useIcon('round-check');
    const infoIcon = useIcon('info');
    const swapIcon = useIcon('swap');
    const videoUploadIcon = useIcon('video-upload');

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
            label: t(`${translationPrefix}.with-video`)
        },
        {
            value: false,
            label: t(`${translationPrefix}.without-video`)
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

    const baseNextUrl = '?details=true';

    const onSave = useCallback(async (isDraft?: boolean) => {
        if (initialVideoId) {
            router.push(baseNextUrl);
            return;
        }

        if (removeVideo && !withVideo) {
            await saveLesson({
                _id: lessonId,
                type: LessonAdditionalSaveType.RemoveVideo,
            });
            router.push(baseNextUrl);
            return;
        }

        if (!withVideo || !videoId) {
            router.push(baseNextUrl);
            return;
        }

        try {
            let synopsis: string | undefined, survey: string | undefined = undefined;

            if (!isDraft) {
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

            await saveLesson({
                videoId, survey, synopsis,
                type: LessonSaveType.Video,
                _id: lessonId
            });

            router.push(`${baseNextUrl}&hasVideo=${!!videoId}`)
        } catch (error) {
            console.error('Ошибка при сохранении:', error);
            throw error;
        }
    }, [JSON.stringify(videoActions), videoId, currentPath, withVideo]);

    if (loadingString) {
        return <div>{t(loadingString)}</div>;
    }

    return (
        <ButtonBackContainer
            type={ChildrenPosition.Bottom}
            hasBackButtonIcon={false}
            compressBody={false}
        >{backButton =>
            <>
                <div className={styles.content}>
                    {!initialVideoId && (<div className={styles.videoSelector}>
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
                    </div>)}
                    {withVideo && <>
                        <CreateLessonVideoHeader
                            title={t(`${translationPrefix}.upload-video.name`)}
                            description={t(`${translationPrefix}.upload-video.description`, {
                                size: getFileSize(fileUploadMaxSize)
                            })}
                            icon={videoUploadIcon}
                        />
                        <VideoUpload
                            setId={setVideoId}
                            handleDelete={() => {
                                setVideoId(undefined);
                                setVideo(null);
                                setRemoveVideo(true);
                                setLesson((lesson: LessonGetByIdResponse | undefined) => {
                                    if (lesson) {
                                        const { videoId, surveyText, synopsisText, ...rest } = lesson;
                                        return rest;
                                    }
                                    return lesson;
                                });
                            }}
                            isUploading={isVideoUploading}
                            setIsUploading={setIsVideoUploading}
                            isUploadError={isVideoUploadError}
                            setIsUploadError={setIsVideoUploadError}
                            video={video}
                            setVideo={setVideo}
                            maxSize={fileUploadMaxSize}
                            apiClientPrefix={userApiClientPrefix}
                            childrenOnVideo={!initialVideoId && (
                                <>
                                    <div className={styles.videoActions}>
                                        <CreateLessonVideoHeader
                                            title={t(`${translationPrefix}.what-to-do-with-video`)}
                                            icon={swapIcon}
                                        />
                                        {videoActions.map((action, index) => (
                                            <span key={index}>
                                                <InputBox
                                                    name={`${translationPrefix}.${action.label}.name`}
                                                    className={styles.videoAction}
                                                    description={`${translationPrefix}.${action.label}.description`}
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
                                                                    i18nLabel: `${translationPrefix}.${key}`,
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
                            )}
                        />
                    </>}
                    {!videoId &&
                        <CreateLessonVideoHeader
                            title={t(`${translationPrefix}.what-else.name`)}
                            description={t(`${translationPrefix}.what-else.description`)}
                            icon={infoIcon}
                        />
                    }
                    {!withVideo &&
                        <CreateLessonVideoHeader
                            title={t(`${translationPrefix}.you-can-add-video-later.name`)}
                            icon={infoIcon}
                        />
                    }
                </div>
                <div className={styles.buttonContainer}>
                    {backButton}
                    <Button
                        onClick={() => onSave(false)}
                        prefix={translationPrefix}
                        type={ButtonType.SAVE}
                        title={t('save')}
                        disabled={withVideo && (!video || !!isVideoUploadError || isVideoUploading || !videoId)}
                    />
                </div>
            </>
            }</ButtonBackContainer>
    );
};
