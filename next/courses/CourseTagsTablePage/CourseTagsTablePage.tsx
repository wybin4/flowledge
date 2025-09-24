"use client";

import { TablePageMode } from "@/types/TablePageMode";
import { CourseTag } from "../types/CourseTag";
import { CourseTagToSave } from "../types/CourseTagToSave";
import { CRUDTablePage } from "@/components/TablePage/CRUDTablePage/CRUDTablePage";
import { createCourseTagsTableHeader } from "../functions/createCourseTagsTableHeader";
import { userApiClient } from "@/apiClient";
import { getDataPageWithApi } from "@/components/TablePage/EnhancedTablePage/functions/getDataPageWithApi";
import { getTotalCountWithApi } from "@/components/TablePage/EnhancedTablePage/functions/getTotalCountWithApi";
import { EnhancedItemType } from "@/components/TablePage/EnhancedTablePage/types/EnhancedItemTypes";
import { courseTagsPrefix } from "@/helpers/prefixes";
import { SettingType } from "@/types/Setting";
import { TFunction } from "i18next";
import { useState } from "react";
import { usePermission } from "@/hooks/usePermission";

export const CourseTagsTablePage = ({ mode }: { mode?: TablePageMode }) => {
    const [selectedItemId, setSelectedItemId] = useState<string | undefined>(undefined);

    const getHeaderItems = (
        t: TFunction, setSortQuery: (query: string) => void
    ) => createCourseTagsTableHeader(
        t, (name, position) => {
            const newSortQuery = position ? `${name}:${position}` : '';
            setSortQuery(newSortQuery);
        }
    );

    const isPermitted = usePermission('manage-tags');

    return (
        <CRUDTablePage<CourseTag, CourseTagToSave, CourseTag>
            prefix={courseTagsPrefix}
            apiClient={userApiClient}
            permissions={{
                isCreationPermitted: isPermitted,
                isEditionPermitted: isPermitted,
                isDeletionPermitted: isPermitted
            }}
            getDataPageFunctions={{
                getDataPage: (prefix, params) => getDataPageWithApi(prefix, userApiClient, params),
                getTotalCount: (prefix, params) => getTotalCountWithApi(prefix, userApiClient, params),
            }}
            selectedItemId={selectedItemId}
            setSelectedItemId={setSelectedItemId}
            mode={mode}
            settingKeys={[
                { name: 'name', types: [SettingType.InputText], hasDescription: true },
            ]}
            transformItemToSave={(item) => {
                return { name: item.name };
            }}
            createEmptyItem={() => ({
                id: '',
                name: '',
            })}
            getHeaderItems={getHeaderItems}
            transformData={(i) => i}
            itemKeys={[
                { name: 'name', type: EnhancedItemType.Text },
            ]}
            hasDeleteDescription={false}
        />
    );
};