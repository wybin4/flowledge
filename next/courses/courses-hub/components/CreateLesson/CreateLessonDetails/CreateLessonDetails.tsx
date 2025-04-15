"use client";

import { userApiClient } from "@/apiClient";
import EnhancedItem from "@/components/TablePage/EnhancedTablePage/EnhancedItem/EnhancedItem";
import { LessonToSaveOnDetailsRequest } from "@/courses/courses-hub/types/LessonToSave";
import { coursesHubLessonsPrefixApi, coursesHubLessonsPrefixTranslate } from "@/helpers/prefixes";
import { SettingType } from "@/types/Setting";
import { TablePageMode } from "@/types/TablePageMode";
import { useTranslation } from "react-i18next";

export const CreateLessonDetails = ({ _id }: { _id: string }) => {
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
                    types: [SettingType.InputNumber, SettingType.SelectorInfinite],
                    hasDescription: true,
                    additionalProps: {
                        placeholder: (type: SettingType) => {
                            switch (type) {
                                case SettingType.InputNumber:
                                    return t('');
                                case SettingType.SelectorInfinite:
                                    return t('time-unit-selection');
                                default:
                                    return t('type-here');
                            }
                        },
                        options: [
                            { label: minutesVal, value: minutesVal },
                            { label: hoursVal, value: hoursVal }
                        ]
                    }
                }
            ]}
            transformItemToSave={item => item}
            createEmptyItem={() => ({
                _id,
                title: '',
                time: minutesVal
            })}
        />
    )
};