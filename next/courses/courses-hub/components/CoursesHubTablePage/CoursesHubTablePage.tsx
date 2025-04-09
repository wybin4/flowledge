"use client";

import { mapCoursesHubToTable } from "../../functions/mapCoursesHubToTable";
import { createCoursesHubTableHeader } from "../../functions/createCoursesHubTableHeader";
import { coursesHubPrefix } from "@/helpers/prefixes";
import { EnhancedTablePage } from "@/components/TablePage/EnhancedTablePage/EnhancedTablePage";
import { t, TFunction } from "i18next";
import { CoursesHubTableItem } from "@/courses/courses-hub/types/CoursesHubTableItem";
import { userApiClient } from "@/apiClient";
import { Course } from "../../../types/Course";
import { EnhancedItemType } from "@/components/TablePage/EnhancedTablePage/types/EnhancedItemTypes";
import RightSidebar from "@/components/Sidebar/RightSidebar/RightSidebar";
import cn from "classnames";
import styles from "./CoursesHubTablePage.module.css";
import { TablePageMode } from "@/types/TablePageMode";
import { useRouter, useSearchParams } from "next/navigation";
import { useNonPersistentSidebar } from "@/hooks/useNonPersistentSidebar";
import { useEffect, useState } from "react";
import { getDataPageWithApi } from "@/components/TablePage/EnhancedTablePage/functions/getDataPageWithApi";
import { getTotalCountWithApi } from "@/components/TablePage/EnhancedTablePage/functions/getTotalCountWithApi";
import { ButtonType } from "@/components/Button/Button";
import { RightSidebarModal } from "@/components/Sidebar/RightSidebar/RightSidebarModal";
import { fakeUser } from "@/helpers/fakeUser";
import { SettingType } from "@/types/Setting";
import { CourseToSave } from "../../types/CourseToSave";

export const CoursesHubTablePage = ({ mode }: { mode?: TablePageMode }) => {
    const [expanded, setExpanded] = useState<boolean>(false);
    const [selectedItemId, setSelectedItemId] = useState<string | undefined>(undefined);

    const router = useRouter();
    const searchParams = useSearchParams();

    const apiPrefix = `${coursesHubPrefix}/courses`;

    const getHeaderItems = (
        t: TFunction, setSortQuery: (query: string) => void
    ) => createCoursesHubTableHeader(
        t, (name, position) => {
            const newSortQuery = position ? `${name}:${position}` : '';
            setSortQuery(newSortQuery);
        }
    );

    const updateState = (mode: string | null, id?: string) => {
        const hasMode = !!mode;
        setExpanded(hasMode);
        setSelectedItemId(hasMode ? id : undefined);
    };

    const onItemClick = (_id?: string) => {
        const currentMode = searchParams.get('mode');
        if (currentMode) {
            router.push(`/${coursesHubPrefix}`);
            updateState(null);
        } else {
            router.push(`/${coursesHubPrefix}/?mode=${TablePageMode.EDIT}`);
            updateState(TablePageMode.EDIT, _id);
        }
    };

    useEffect(() => {
        if (!selectedItemId && mode === TablePageMode.EDIT) {
            router.push(`/${coursesHubPrefix}`);
        } else {
            const currentMode = searchParams.get('mode');
            updateState(currentMode, selectedItemId);
        }
    }, [searchParams.get('mode')]);

    const handleEditContent = () => {
        router.push(`/${coursesHubPrefix}/${selectedItemId}`);
    };

    return (
        <RightSidebar
            useSidebarHook={useNonPersistentSidebar}
            expanded={expanded}
            content={classNames => <div className={cn(classNames)}>{mode &&
                <RightSidebarModal<Course, CourseToSave>
                    prefix={coursesHubPrefix}
                    apiPrefix={apiPrefix}
                    queryParams={{ isSmall: true }}
                    mode={mode}
                    _id={selectedItemId}
                    settingKeys={[
                        { name: 'title', type: SettingType.InputText },
                        { name: 'description', type: SettingType.InputText },
                        { name: 'imageUrl', type: SettingType.InputText },
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
                        updatedAt: ""
                    })}
                    onBackButtonClick={() => updateState(null)}
                    additionalButtons={[
                        {
                            title: t(`${coursesHubPrefix}.edit-content`),
                            onClick: handleEditContent,
                            mode: TablePageMode.EDIT,
                            type: ButtonType.EDIT
                        }
                    ]}
                />
            }</div>}>
            {(isExpanded, toggleSidebar) => (
                <div>
                    <EnhancedTablePage<Course, CoursesHubTableItem>
                        prefix={coursesHubPrefix}
                        apiPrefix={apiPrefix}
                        getDataPageFunctions={{
                            getDataPage: (prefix, params) => getDataPageWithApi(prefix, userApiClient, params),
                            getTotalCount: (prefix, params) => getTotalCountWithApi(prefix, userApiClient, params),
                        }}
                        getHeaderItems={getHeaderItems}
                        transformData={mapCoursesHubToTable}
                        itemKeys={[
                            { name: 'imageUrl', type: EnhancedItemType.Image },
                            { name: 'title', type: EnhancedItemType.Text },
                            { name: 'creator', type: EnhancedItemType.Text },
                            { name: 'createdAt', type: EnhancedItemType.Text },
                        ]}
                        onItemClick={(_id) => {
                            toggleSidebar();
                            onItemClick(_id);
                        }}
                        className={cn({
                            [styles.elementsExpanded]: isExpanded
                        })}
                        tableStyles={cn({
                            [styles.bodyExpanded]: isExpanded
                        })}
                    />
                </div>
            )}
        </RightSidebar>
    );
};