"use client";

import CollapsibleSection from "@/components/CollapsibleSection/CollapsibleSection";
import styles from "./CoursesListInfinitePage.module.css";
import { useTranslation } from "react-i18next";
import { ExtendedSearch, ExtendedSearchType } from "@/components/ExtendedSearch/ExtendedSearch";
import { ChangeEvent, useState } from "react";
import { useTags } from "@/courses/courses-hub/hooks/useTags";
import { usePrivateSetting } from "@/private-settings/hooks/usePrivateSetting";
import { Checkbox } from "@/components/Checkbox/Checkbox";

export const CoursesListInfiniteFilters = () => {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState<string>('');

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const pageSize = usePrivateSetting<number>('preview-page-size') || 5;
    const { tags } = useTags();

    return (
        <>
            <CollapsibleSection
                expandedDeg={-180}
                collapsedDeg={0}
                title={t('tags')}
                expandedByDefault={true}
                iconPrefix='-little'
                contentExpandedClassName={styles.collapsed}
                headerClassName={styles.collapsedHeader}
            >
                <div className={styles.filterContent}>
                    <ExtendedSearch
                        query={searchQuery}
                        setQuery={handleSearchChange}
                        type={ExtendedSearchType.SemiDark}
                        className={styles.filterSearch}
                        iconClassName={styles.filterSearchIcon}
                    />
                    {tags.slice(0, pageSize).map((tag, index) => (
                        <div key={index} className={styles.filterItem}>
                            <Checkbox label={tag.name} />
                        </div>
                    ))}
                </div>
            </CollapsibleSection>
            <CollapsibleSection
                expandedDeg={-180}
                collapsedDeg={0}
                title={t('duration')}
                iconPrefix='-little'
                contentExpandedClassName={styles.collapsed}
                headerClassName={styles.collapsedHeader}
            />
            <CollapsibleSection
                expandedDeg={-180}
                collapsedDeg={0}
                title={t('type')}
                iconPrefix='-little'
                contentExpandedClassName={styles.collapsed}
                headerClassName={styles.collapsedHeader}
            />
        </>
    );
};