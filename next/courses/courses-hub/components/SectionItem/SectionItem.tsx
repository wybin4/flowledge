"use client";

import { Course } from "../../../types/Course";
import { coursesHubPrefix } from "@/helpers/prefixes";
import { userApiClient } from "@/apiClient";
import EnhancedItem from "@/components/TablePage/EnhancedTablePage/EnhancedItem/EnhancedItem";
import { SettingType } from "@/types/Setting";
import { TablePageMode } from "@/types/TablePageMode";
import { CourseToSave } from "../../types/CourseToSave";
import { fakeUser } from "@/helpers/fakeUser";
import { useIcon } from "@/hooks/useIcon";
import styles from "./CoursesHubItem.module.css";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { ButtonType } from "@/components/Button/Button";

interface CoursesHubItemProps {
    mode: TablePageMode;
    _id?: string;
    onBackButtonClick?: () => void;
}

export const CoursesHubItem = ({ mode, _id, onBackButtonClick }: CoursesHubItemProps) => {
    const closeIcon = useIcon('close');
    const { t } = useTranslation();
    const router = useRouter();

    const handleEditContent = () => {
        router.push(`/${coursesHubPrefix}/${_id}`);
    };

    return (
        <EnhancedItem<Course, CourseToSave>
            prefix={coursesHubPrefix}
            apiPrefix={`${coursesHubPrefix}/courses`}
            queryParams={{ isSmall: true }}
            mode={mode}
            _id={_id}
            settingKeys={[
                { name: 'title', types: [SettingType.InputText] },
                { name: 'description', types: [SettingType.InputText] },
                { name: 'imageUrl', types: [SettingType.InputText] },
            ]}
            apiClient={userApiClient}
            transformItemToSave={(item) => {
                const { title, description, imageUrl } = item;
                const body = {
                    title, description, imageUrl, u: fakeUser
                };
                return body;
            }}
            createEmptyItem={() => ({
                _id: "",
                title: "",
                description: "",
                imageUrl: "",
                u: fakeUser,
                createdAt: "",
                updatedAt: "",
                tags: []
            })}
            backButton={{
                onBackButtonClick: onBackButtonClick,
                backButtonIcon: closeIcon,
                hasBackButtonText: false,
                backButtonStyles: styles.backButton
            }}
            containerStyles={styles.container}
            additionalButtons={[
                {
                    title: t(`${coursesHubPrefix}.edit-content`),
                    onClick: handleEditContent,
                    mode: TablePageMode.EDIT,
                    type: ButtonType.EDIT
                }
            ]}
        />
    );
};