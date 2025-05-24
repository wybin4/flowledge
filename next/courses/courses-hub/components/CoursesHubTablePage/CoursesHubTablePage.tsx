"use client";

import { mapCoursesHubToTable } from "../../functions/mapCoursesHubToTable";
import { createCoursesHubTableHeader } from "../../functions/createCoursesHubTableHeader";
import { coursesHubPrefix, coursesHubPrefixApi } from "@/helpers/prefixes";
import { t, TFunction } from "i18next";
import { CoursesHubTableItem } from "@/courses/courses-hub/types/CoursesHubTableItem";
import { userApiClient } from "@/apiClient";
import { Course } from "../../../types/Course";
import { EnhancedItemType } from "@/components/TablePage/EnhancedTablePage/types/EnhancedItemTypes";
import { TablePageMode } from "@/types/TablePageMode";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { getDataPageWithApi } from "@/components/TablePage/EnhancedTablePage/functions/getDataPageWithApi";
import { getTotalCountWithApi } from "@/components/TablePage/EnhancedTablePage/functions/getTotalCountWithApi";
import { ButtonType } from "@/components/Button/Button";
import { fakeUser } from "@/helpers/fakeUser";
import { SettingType } from "@/types/Setting";
import { CourseToSave } from "../../types/CourseToSave";
import { CRUDTablePage } from "@/components/TablePage/CRUDTablePage/CRUDTablePage";
import { getTagsSettingKey } from "../../functions/getTagsSettingKey";
import { useTags } from "../../hooks/useTags";
import { usePermissions } from "@/hooks/usePermissions";
import { CourseSubscriptions } from "@/collections/CourseSubscriptions";
import { DataPageHookFunctions } from "@/types/DataPageHook";

const coursesHubTablePermissions = [
    'view-all-courses',
    'view-assigned-courses',
    'create-course',
    'edit-course',
    'delete-course'
];

export const CoursesHubTablePage = ({ mode }: { mode?: TablePageMode }) => {
    const [selectedItemId, setSelectedItemId] = useState<string | undefined>(undefined);
    const { tags } = useTags();

    const [
        viewAll,
        viewAssigned,
        isCreationPermitted,
        isEditionPermitted,
        isDeletionPermitted
    ] = usePermissions(coursesHubTablePermissions);

    const router = useRouter();

    const getHeaderItems = (
        t: TFunction, setSortQuery: (query: string) => void
    ) => createCoursesHubTableHeader(
        t, (name, position) => {
            const newSortQuery = position ? `${name}:${position}` : '';
            setSortQuery(newSortQuery);
        }
    );

    const handleEditContent = () => {
        router.push(`/${coursesHubPrefix}/${selectedItemId}`);
    };

    const getDataPageFunctions: DataPageHookFunctions<Course> = useMemo(() => {
        if (viewAll) {
            return {
                getDataPage: (prefix, params) => getDataPageWithApi(prefix, userApiClient, params),
                getTotalCount: (prefix, params) => getTotalCountWithApi(prefix, userApiClient, params),
            };
        } else if (viewAssigned) {
            return {
                getDataPage: (_, props) => CourseSubscriptions.getPage(props) as any,
                getTotalCount: (_, props) => CourseSubscriptions.getTotalCount(props),
            };
        }
        return {
            getDataPage: () => Promise.resolve([]),
            getTotalCount: () => Promise.resolve(0),
        };
    }, [viewAll, viewAssigned]);
    
    return (
        <CRUDTablePage<Course, CourseToSave, CoursesHubTableItem>
            prefix={coursesHubPrefix}
            apiPrefix={coursesHubPrefixApi}
            apiClient={userApiClient}
            queryParams={{ isSmall: true }}
            getDataPageFunctions={getDataPageFunctions}
            selectedItemId={selectedItemId}
            setSelectedItemId={setSelectedItemId}
            mode={mode}
            settingKeys={[
                { name: 'title', types: [SettingType.InputText], hasDescription: true },
                { name: 'description', types: [SettingType.TextArea] },
                { name: 'imageUrl', types: [SettingType.InputText] },
                getTagsSettingKey(tags),
                {
                    name: 'isPublished', types: [SettingType.Radio],
                    hasDescription: true,
                    additionalProps: { withWrapper: false }
                },
            ]}
            transformItemToSave={(item) => {
                const { title, description, imageUrl, tags: tagsToSave, isPublished } = item;
                const body = {
                    title, description, imageUrl, tags: tagsToSave, isPublished
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
                tags: [],
                isPublished: false,
                versionId: "",
                versionName: "0.1"
            })}
            additionalButtons={[
                isEditionPermitted ? {
                    title: t(`${coursesHubPrefix}.edit-content`),
                    onClick: handleEditContent,
                    mode: TablePageMode.EDIT,
                    type: ButtonType.EDIT
                } : undefined
            ]}
            getHeaderItems={getHeaderItems}
            transformData={mapCoursesHubToTable}
            itemKeys={[
                { name: 'imageUrl', type: EnhancedItemType.Image },
                { name: 'title', type: EnhancedItemType.Text },
                { name: 'creator', type: EnhancedItemType.Text },
                { name: 'isPublished', type: EnhancedItemType.Text },
                { name: 'versionName', type: EnhancedItemType.Text },
                { name: 'createdAt', type: EnhancedItemType.Text },
            ]}
            permissions={{
                isCreationPermitted,
                isEditionPermitted,
                isDeletionPermitted
            }}
        />
    );
};