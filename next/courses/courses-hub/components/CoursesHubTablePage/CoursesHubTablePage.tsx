"use client";

import { mapCoursesHubToTable } from "../../functions/mapCoursesHubToTable";
import { createCoursesHubTableHeader } from "../../functions/createCoursesHubTableHeader";
import { coursesHubPrefix } from "@/helpers/prefixes";
import { EnhancedTablePage } from "@/components/TablePage/EnhancedTablePage/EnhancedTablePage";
import { TFunction } from "i18next";
import { CoursesHubTableItem } from "@/courses/courses-hub/types/CoursesHubTableItem";
import { userApiClient } from "@/apiClient";
import { Course } from "../../../types/Course";
import { EnhancedItemType } from "@/components/TablePage/EnhancedTablePage/types/EnhancedItemTypes";
import RightSidebar from "@/components/Sidebar/RightSidebar";
import cn from "classnames";
import styles from "./CoursesHubTablePage.module.css";

export const CoursesHubTablePage = () => {
    const getHeaderItems = (
        t: TFunction, setSortQuery: (query: string) => void
    ) => createCoursesHubTableHeader(
        t, (name, position) => {
            const newSortQuery = position ? `${name}:${position}` : '';
            setSortQuery(newSortQuery);
        }
    );

    return (
        <RightSidebar content={classNames => <div>sdfsdfsdf</div>}>
            {(isExpanded, onClick) => (
                <div>
                    <EnhancedTablePage<Course, CoursesHubTableItem>
                        prefix={coursesHubPrefix}
                        getHeaderItems={getHeaderItems}
                        transformData={mapCoursesHubToTable}
                        itemKeys={[
                            { name: 'imageUrl', type: EnhancedItemType.Image },
                            { name: 'title', type: EnhancedItemType.Text },
                            { name: 'creator', type: EnhancedItemType.Text },
                            { name: 'createdAt', type: EnhancedItemType.Text },
                        ]}
                        apiClient={userApiClient}
                        onItemClick={onClick}
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