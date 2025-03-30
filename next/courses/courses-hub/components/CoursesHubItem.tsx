"use client";

import { Course } from "../../types/Course";
import { coursesHubPrefix } from "@/helpers/prefixes";
import { userApiClient } from "@/apiClient";
import { EnhancedItem } from "@/components/TablePage/EnhancedTablePage/EnhancedItem/EnhancedItem";
import { SettingType } from "@/types/Setting";
import { TablePageMode } from "@/types/TablePageMode";
import { CourseToSave } from "../types/CourseToSave";
import { fakeUser } from "@/helpers/fakeUser";
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
                { name: 'description', type: SettingType.InputText },
            ]}
            apiClient={userApiClient}
            transformItemToSave={(item) => {
                const { title, description } = item;
                const body = {
                    title, description, u: fakeUser
                };
                return body;
            }}
        />
    );
};