"use client";

import { mapCoursesHubToTable } from "../../functions/mapCoursesHubToTable";
import { createCoursesHubTableHeader } from "../../functions/createCoursesHubTableHeader";
import { coursesHubPrefix, coursesHubPrefixApi, courseTagsPrefix } from "@/helpers/prefixes";
import { t, TFunction } from "i18next";
import { CoursesHubTableItem } from "@/courses/courses-hub/types/CoursesHubTableItem";
import { userApiClient } from "@/apiClient";
import { Course } from "../../../types/Course";
import { EnhancedItemType } from "@/components/TablePage/EnhancedTablePage/types/EnhancedItemTypes";
import { TablePageMode } from "@/types/TablePageMode";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getDataPageWithApi } from "@/components/TablePage/EnhancedTablePage/functions/getDataPageWithApi";
import { getTotalCountWithApi } from "@/components/TablePage/EnhancedTablePage/functions/getTotalCountWithApi";
import { ButtonType } from "@/components/Button/Button";
import { fakeUser } from "@/helpers/fakeUser";
import { SettingType } from "@/types/Setting";
import { CourseToSave } from "../../types/CourseToSave";
import { CourseTag } from "../../../types/CourseTag";
import { CRUDTablePage } from "@/components/TablePage/CRUDTablePage/CRUDTablePage";

export const CoursesHubTablePage = ({ mode }: { mode?: TablePageMode }) => {
    const [selectedItemId, setSelectedItemId] = useState<string | undefined>(undefined);
    const [tags, setTags] = useState<CourseTag[]>([]);

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

    useEffect(() => {
        userApiClient.get<CourseTag[]>(`${courseTagsPrefix}.get`).then(items => {
            if (items && items.length) {
                setTags(items);
            }
        });
    }, []);

    return (
        <CRUDTablePage<Course, CourseToSave, CoursesHubTableItem>
            prefix={coursesHubPrefix}
            apiPrefix={coursesHubPrefixApi}
            apiClient={userApiClient}
            queryParams={{ isSmall: true }}
            getDataPageFunctions={{
                getDataPage: (prefix, params) => getDataPageWithApi(prefix, userApiClient, params),
                getTotalCount: (prefix, params) => getTotalCountWithApi(prefix, userApiClient, params),
            }}
            selectedItemId={selectedItemId}
            setSelectedItemId={setSelectedItemId}
            mode={mode}
            settingKeys={[
                { name: 'title', types: [SettingType.InputText] },
                { name: 'description', types: [SettingType.TextArea] },
                { name: 'imageUrl', types: [SettingType.InputText] },
                {
                    name: 'tags',
                    i18nLabel: 'tags',
                    types: [SettingType.SelectorInfiniteMultiple],
                    additionalProps: {
                        options: tags.map(t => ({ value: t._id, label: t.name })),
                        prefix: coursesHubPrefix,
                        selectedKey: 'tags_selected'
                    }
                },
            ]}
            transformItemToSave={(item) => {
                const { title, description, imageUrl, tags: tagsToSave } = item;
                const body = {
                    title, description, imageUrl, u: fakeUser, tags: tagsToSave
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
            additionalButtons={[
                {
                    title: t(`${coursesHubPrefix}.edit-content`),
                    onClick: handleEditContent,
                    mode: TablePageMode.EDIT,
                    type: ButtonType.EDIT
                }
            ]}
            getHeaderItems={getHeaderItems}
            transformData={mapCoursesHubToTable}
            itemKeys={[
                { name: 'imageUrl', type: EnhancedItemType.Image },
                { name: 'title', type: EnhancedItemType.Text },
                { name: 'creator', type: EnhancedItemType.Text },
                { name: 'createdAt', type: EnhancedItemType.Text },
            ]}
        />
    );
};