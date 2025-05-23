"use client";

import { userApiClient } from "@/apiClient";
import EnhancedItem from "@/components/TablePage/EnhancedTablePage/EnhancedItem/EnhancedItem";
import { LessonToSaveOnDetails, LessonToSaveOnDetailsRequest, LessonToSaveOnDetailsRequestTime } from "@/courses/courses-hub/types/LessonToSave";
import { coursesHubLessonsPrefixApi, coursesHubLessonsPrefixTranslate } from "@/helpers/prefixes";
import { ChildrenPosition } from "@/types/ChildrenPosition";
import { SettingType, SettingValue } from "@/types/Setting";
import { TablePageMode } from "@/types/TablePageMode";
import { TimeUnit } from "@/types/TimeUnit";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import styles from "./CreateLessonDetails.module.css";
import { CreateLessonChildrenProps } from "../CreateLesson";
import { parseTimeUnit } from "@/helpers/parseTimeUnit";
import { useEffect, useState } from "react";
import { LessonSaveType } from "@/courses/types/LessonSaveType";

interface CreateLessonDetailsProps extends CreateLessonChildrenProps {
    hasVideo: boolean;
    title?: string;
    time?: TimeUnit
    imageUrl?: string;
}

export const CreateLessonDetails = ({ lessonId, title, time, imageUrl, hasVideo }: CreateLessonDetailsProps) => {
    const { t } = useTranslation();
    const translationPrefix = coursesHubLessonsPrefixTranslate;

    const [lesson, setLesson] = useState<LessonToSaveOnDetails | undefined>(undefined);

    useEffect(() => {
        const { value, unit } = (time && parseTimeUnit(time)) ?? { value: 0, unit: TimeUnit.MINS };
        const details: LessonToSaveOnDetails = {
            _id: lessonId,
            title: title ?? '',
            imageUrl,
            time: {
                time: value,
                timeUnit: unit,
                autoDetect: false
            }
        };
        setLesson(details);
    }, [lessonId, title, imageUrl, time]);

    const minutesVal = t('minutes-abbr');
    const hoursVal = t('hours-abbr');

    const router = useRouter();

    return (
        <EnhancedItem<LessonToSaveOnDetails, LessonToSaveOnDetailsRequest>
            permissions={{ isEditionPermitted: true, isDeletionPermitted: true }}
            containerStyles={styles.body}
            hasTitle={false}
            passedInitialValues={lesson}
            settingsContainerClassNames={styles.settingsContainer}
            buttonContainerClassNames={styles.buttonContainer}
            mode={TablePageMode.CREATE}
            prefix={translationPrefix}
            apiPrefix={coursesHubLessonsPrefixApi}
            apiClient={userApiClient}
            settingKeys={[
                { name: 'title', types: [SettingType.InputText] },
                { name: 'imageUrl', types: [SettingType.InputText] },
                {
                    name: 'time',
                    types: [
                        SettingType.InputNumber,
                        SettingType.SelectorInfinite,
                        // ...(hasVideo ? [SettingType.Radio] : []) TODO: fix it
                    ],
                    hasDescription: true,
                    additionalProps: {
                        label: (val: number) => {
                            switch (val) {
                                case 0:
                                    return 'time';
                                case 1:
                                    return 'timeUnit';
                                case 2:
                                    return 'autoDetect';
                            }
                        },
                        placeholder: (type: SettingType) => {
                            switch (type) {
                                case SettingType.InputNumber:
                                    return '';
                                case SettingType.SelectorInfinite:
                                    return t('time-unit-selection');
                                case SettingType.Radio:
                                    return t('auto-detect');
                                default:
                                    return t('type-here');
                            }
                        },
                        options: [
                            { label: minutesVal, value: TimeUnit.MINS },
                            { label: hoursVal, value: TimeUnit.HOURS }
                        ],
                        disable: (setting: SettingValue) => {
                            const isAutoDetectEnabled = (setting.value as LessonToSaveOnDetailsRequestTime)['autoDetect'];
                            if (setting.type !== SettingType.Radio && isAutoDetectEnabled) {
                                return true;
                            }
                            return false;
                        }
                    }
                }
            ]}
            transformItemToSave={item => {
                const { _id, title, time } = item;
                return { _id, title, ...time, type: LessonSaveType.Details }
            }}
            onActionCallback={() => router.push('?synopsis=true')}
            isBackWithRouter={false}
            backButton={{
                type: ChildrenPosition.Bottom,
                hasBackButtonIcon: false,
                compressBody: false
            }}
        />
    )
};