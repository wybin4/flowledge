"use client";

import { Course } from "../types/Course";
import { coursesHubPrefix } from "@/helpers/prefixes";
import { userApiClient } from "@/apiClient";
import { EnhancedItem } from "@/components/TablePage/EnhancedTablePage/EnhancedItem/EnhancedItem";
import { SettingType } from "@/types/Setting";
import { TablePageMode } from "@/types/TablePageMode";
import { CourseToSave } from "../types/CourseToSave";

interface CoursesHubItemProps {
    mode: TablePageMode;
    _id?: string;
}

export const CoursesHubItem = ({ mode, _id }: CoursesHubItemProps) => {
    return (
        <EnhancedItem<Course, CourseToSave>
            prefix={coursesHubPrefix}
            mode={mode}
            _id={_id}
            settingKeys={[
                { name: 'title', type: SettingType.InputText },
            ]}
            apiClient={userApiClient}
            transformItemToSave={(item) => {
                // const { name, secret, script, u, enabled } = item;
                // const body = { name, secret, script, u, enabled };
                // console.log(body);
                return item;
            }}
        />
    );
};