import React, { useMemo, useState } from "react";
import { TablePage } from "../../../components/TablePage/TablePage/TablePage";
import { TablePageSearch } from "../../../components/TablePage/TablePage/TablePageSearch";
import PageLayout from "../../../components/PageLayout/PageLayout";
import { TablePageHeader } from "@/components/TablePage/TablePageHeader/TablePageHeader";
import styles from "./EnhancedTablePage.module.css";
import { Sortable } from "@/types/Sortable";
import { useRouter } from "next/navigation";
import { useUserSetting } from "@/user/hooks/useUserSetting";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { Identifiable } from "@/types/Identifiable";
import { IconKey } from "@/hooks/useIcon";
import { EnhancedTablePageItem } from "./EnhancedTablePageItem/EnhancedTablePageItem";
import { TablePageMode } from "@/types/TablePageMode";
import { ChildrenPosition } from "@/types/ChildrenPosition";
import { EnhancedItemChildren } from "./types/EnhancedItemChildren";
import cn from "classnames";
import { DataPageHookFunctions } from "@/types/DataPageHook";
import { useEnhancedPagination } from "@/hooks/useEnhancedPagination";
import { Language } from "@/user/types/Language";

export interface EnhancedTablePageProps<T, U> {
    prefix: IconKey;
    apiPrefix?: string;
    transformData: (data: T, locale: string, t: TFunction) => U;
    getHeaderItems: (t: TFunction, setSortQuery: (query: string) => void) => Sortable[];
    itemKeys: EnhancedItemChildren[];
    onItemClick?: (_id: string) => void;
    className?: string;
    tableStyles?: string;
    getDataPageFunctions: DataPageHookFunctions<T>;
}

export const EnhancedTablePage = <T extends Identifiable, U extends Identifiable>({
    prefix,
    apiPrefix,
    transformData,
    getHeaderItems,
    itemKeys,
    onItemClick,
    className,
    tableStyles,
    getDataPageFunctions,
}: EnhancedTablePageProps<T, U>) => {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [sortQuery, setSortQuery] = useState<string>('');
    const locale = useUserSetting<Language>('language') || Language.EN;
    const router = useRouter();
 
    const realPrefix = apiPrefix ?? prefix;

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
    };

    const handleCreate = () => {
        router.push(`/${prefix}?mode=${TablePageMode.CREATE}`);
    }

    const headerItems = useMemo(() => getHeaderItems(t, setSortQuery), [t, sortQuery]);

    const {
        data,
        currentPage,
        totalPages,
        totalCount,
        handleNextPage,
        handlePreviousPage,
    } = useEnhancedPagination<T>({
        getDataPageFunctions,
        apiPrefix: realPrefix,
        searchQuery,
        sortQuery,
    });

    const mappedData = useMemo(() => data.map(item => transformData(item, locale, t)), [JSON.stringify(data), locale]);

    return (
        <PageLayout
            name={prefix}
            type='block'
            headerProps={{
                headerChildren: (
                    <div
                        className={styles.createButton}
                        onClick={handleCreate}>{t(`${prefix}.create`)}
                    </div>
                ),
                headerInfo: `${totalCount}`,
                headerChildrenPosition: ChildrenPosition.Right,
                headerStyles: cn(styles.container, className)
            }}
            mainStyles={tableStyles}
            mainChildren={
                <>
                    <TablePageSearch
                        query={searchQuery}
                        onChange={handleSearchChange}
                        placeholder={`${prefix}.placeholder`}
                        className={className}
                    />
                    <TablePage
                        header={
                            <TablePageHeader
                                items={headerItems}
                                align='left'
                                className={styles.header}
                            />
                        }
                        body={mappedData.map((item) =>
                            <EnhancedTablePageItem
                                key={item._id}
                                item={item}
                                mode={TablePageMode.EDIT}
                                itemKeys={itemKeys}
                                prefix={prefix}
                                onClick={onItemClick}
                            />
                        )}
                        pagination={{
                            totalCount,
                            currentPage,
                            totalPages,
                            handleNextPage,
                            handlePreviousPage,
                        }}
                        bodyStyles={styles.body}
                        tableStyles={cn(styles.table, className)}
                    />
                </>
            }
        />
    );
};
