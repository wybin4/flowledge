"use client";

import { usePagination } from "@/hooks/usePagination";
import { TablePage } from "../../../components/tablePage/TablePage";
import { useMemo, useState } from "react";
import { TablePageSearch } from "../../../components/tablePage/TablePageSearch";
import PageLayout from "../../../components/pageLayout/PageLayout";
import { usePrivateSetting } from "@/private-settings/hooks/usePrivateSetting";
import { ApiIntegration } from "../../types/ApiIntegration";
import { useTranslation } from "react-i18next";
import { TablePageHeader } from "@/components/tablePage/tablePageHeader/TablePageHeader";
import { useUserSetting } from "@/user/hooks/useUserSetting";
import styles from "./ApiIntegrationsTablePage.module.css";
import { useRouter } from "next/navigation";
import { ApiIntegrationMode } from "@/api-integrations/types/ApiIntegrationMode";
import { useGetApiIntegrations } from "@/api-integrations/hooks/useGetApiIntegrations";
import { ApiIntegrationsTablePageItem } from "./ApiIntegrationsTablePageItem";
import { mapApiIntegrationToTable } from "@/api-integrations/functions/mapApiIntegrationToTable";
import { createApiIntegrationTableHeader } from "@/api-integrations/functions/createApiIntegrationTableHeader";

export const ApiIntegrationsTablePage = () => {
    const { t } = useTranslation();

    const [searchQuery, setSearchQuery] = useState('');
    const [sortQuery, setSortQuery] = useState<string>('');
    const itemsPerPage = usePrivateSetting<number>('search.page-size') || 10;
    const locale = useUserSetting<string>('language') || 'en';
    const router = useRouter();

    const headerItems = useMemo(() =>
        createApiIntegrationTableHeader(
            t, (name, position) => {
                const newSortQuery = position ? `${name}:${position}` : '';
                setSortQuery(newSortQuery);
            }
        ), [t, sortQuery]
    );

    const { getDataPage, getTotalCount } = useGetApiIntegrations();

    const {
        data,
        currentPage,
        totalPages,
        totalCount,
        handleNextPage,
        handlePreviousPage,
    } = usePagination<ApiIntegration>({
        itemsPerPage,
        getDataPage,
        getTotalCount,
        searchQuery,
        sortQuery,
    });

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleCreate = () => {
        router.push(`/api-integrations?mode=${ApiIntegrationMode.CREATE}`);
    }

    const mappedData = useMemo(() => data.map(integration => mapApiIntegrationToTable(integration, locale, t)), [JSON.stringify(data)]);

    return (
        <PageLayout
            name='api-integrations'
            type='block'
            headerChildren={
                <div
                    className={styles.createButton}
                    onClick={handleCreate}>{t('api-integrations.create')}
                </div>
            }
            headerInfo={`${totalCount}`}
            headerChildrenPosition='right'
            headerStyles={styles.container}
            mainChildren={
                <>
                    <TablePageSearch
                        query={searchQuery}
                        onChange={handleSearchChange}
                        placeholder='api-integrations.placeholder'
                    />
                    <TablePage
                        header={
                            <TablePageHeader
                                items={headerItems}
                                isTranslated={true}
                                align='left'
                            />
                        }
                        body={mappedData.map((integration) => (
                            <ApiIntegrationsTablePageItem
                                key={integration._id}
                                integration={integration}
                            />
                        ))}
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