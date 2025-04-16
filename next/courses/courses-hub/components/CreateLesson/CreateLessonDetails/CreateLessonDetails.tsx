"use client";

import { userApiClient } from "@/apiClient";
import EnhancedItem from "@/components/TablePage/EnhancedTablePage/EnhancedItem/EnhancedItem";
import { LessonToSaveOnDetailsRequest, LessonToSaveOnDetailsRequestTime } from "@/courses/courses-hub/types/LessonToSave";
import { coursesHubLessonsPrefixApi, coursesHubLessonsPrefixTranslate } from "@/helpers/prefixes";
import { SettingType, SettingValue } from "@/types/Setting";
import { TablePageMode } from "@/types/TablePageMode";
import { useTranslation } from "react-i18next";

export const CreateLessonDetails = ({ _id, hasVideo }: { _id: string, hasVideo: boolean }) => {
    const { t } = useTranslation();
    const translationPrefix = coursesHubLessonsPrefixTranslate;

    const minutesVal = t('minutes-abbr');
    const hoursVal = t('hours-abbr');

    return (
        <EnhancedItem<LessonToSaveOnDetailsRequest, LessonToSaveOnDetailsRequest>
            mode={TablePageMode.CREATE}
            prefix={translationPrefix}
            apiPrefix={coursesHubLessonsPrefixApi}
            apiClient={userApiClient}
            settingKeys={[
                { name: 'title', types: [SettingType.InputText] },
                {
                    name: 'time',
                    types: [
                        SettingType.InputNumber,
                        SettingType.SelectorInfinite,
                        ...(hasVideo ? [SettingType.Radio] : [])
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
                            { label: minutesVal, value: minutesVal },
                            { label: hoursVal, value: hoursVal }
                        ],
                        disable: (setting: SettingValue) => {
                            console.warn('pl1', (setting.value as LessonToSaveOnDetailsRequestTime)['autoDetect'])
                            const isAutoDetectEnabled = (setting.value as LessonToSaveOnDetailsRequestTime)['autoDetect'];
                            if (setting.type !== SettingType.Radio && isAutoDetectEnabled) {
                                return true;
                            }
                            return false;
                        }
                    }
                }
            ]}
            transformItemToSave={item => item}
            createEmptyItem={() => ({
                _id,
                title: '',
                time: {
                    time: undefined,
                    timeUnit: minutesVal,
                    autoDetect: true
                }
            })}
        />
    )
};