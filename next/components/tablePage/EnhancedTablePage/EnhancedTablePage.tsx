import React, { useMemo, useState } from "react";
import { TablePage } from "../../../components/TablePage/TablePage/TablePage";
import { TablePageSearch } from "../../../components/TablePage/TablePage/TablePageSearch";
import PageLayout from "../../../components/PageLayout/PageLayout";
import { TablePageHeader } from "@/components/TablePage/TablePageHeader/TablePageHeader";
import styles from "./EnhancedTablePage.module.css";
import { Sortable } from "@/types/Sortable";
import { useRouter } from "next/navigation";
import { useUserSetting } from "@/user/hooks/useUserSetting";
import { usePrivateSetting } from "@/private-settings/hooks/usePrivateSetting";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { usePagination } from "@/hooks/usePagination";
import { Identifiable } from "@/types/Identifiable";
import { IconKey } from "@/hooks/useIcon";
import { EnhancedTablePageItem } from "./EnhancedTablePageItem";
import { TablePageMode } from "@/types/TablePageMode";
import { useGetEnhancedTablePageItems } from "./hooks/useGetEnhancedTablePageItems";
import { ApiClient, FakeApiClient } from "@/types/ApiClient";
import { ChildrenPosition } from "@/types/ChildrenPosition";

interface EnhancedTablePageProps<T, U> {
    prefix: IconKey;
    pageSize?: number;
    transformData: (data: T, locale: string, t: TFunction) => U;
    getHeaderItems: (t: TFunction, setSortQuery: (query: string) => void) => Sortable[];
    itemKeys: string[];
    apiClient: ApiClient<T> | FakeApiClient<T>;
}

export const EnhancedTablePage = <T extends Identifiable, U extends Identifiable>({
    prefix,
    pageSize,
    transformData,
    getHeaderItems,
    itemKeys,
    apiClient,
}: EnhancedTablePageProps<T, U>) => {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [sortQuery, setSortQuery] = useState<string>('');
    const itemsPerPage = pageSize ? pageSize : usePrivateSetting<number>('search.page-size') || 10;
    const locale = useUserSetting<string>('language') || 'en';
    const router = useRouter();

    const getDataPageHook = useGetEnhancedTablePageItems(prefix, apiClient);

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
    } = usePagination<T>({
        itemsPerPage,
        getDataPageHook,
        searchQuery,
        sortQuery,
    });

    const mappedData = useMemo(() => data.map(item => transformData(item, locale, t)), [JSON.stringify(data), locale]);

    return (
        <PageLayout
            name={prefix}
            type='block'
            headerChildren={
                <div
                    className={styles.createButton}
                    onClick={handleCreate}>{t(`${prefix}.create`)}
                </div>
            }
            headerInfo={`${totalCount}`}
            headerChildrenPosition={ChildrenPosition.Right}
            headerStyles={styles.container}
            mainChildren={
                <>
                    <TablePageSearch
                        query={searchQuery}
                        onChange={handleSearchChange}
                        placeholder={`${prefix}.placeholder`}
                    />
                    <TablePage
                        header={
                            <TablePageHeader
                                items={headerItems}
                                isTranslated={true}
                                align='left'
                            />
                        }
                        body={mappedData.map((item) =>
                            <EnhancedTablePageItem
                                key={item._id}
                                item={item}
                                mode={TablePageMode.EDIT}
                                itemKeys={itemKeys}
                                prefix={prefix}
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
                    />
                </>
            }
        />
    );
};
