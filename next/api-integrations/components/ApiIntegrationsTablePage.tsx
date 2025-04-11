"use client";

import { ApiIntegration } from "../types/ApiIntegration";
import { mapApiIntegrationToTable } from "@/api-integrations/functions/mapApiIntegrationToTable";
import { createApiIntegrationTableHeader } from "@/api-integrations/functions/createApiIntegrationTableHeader";
import { apiIntegrationsPrefix } from "@/helpers/prefixes";
import { EnhancedTablePage } from "@/components/TablePage/EnhancedTablePage/EnhancedTablePage";
import { TFunction } from "i18next";
import { ApiIntegrationTableItem } from "@/api-integrations/types/ApiIntegrationTableItem";
import { integrationApiClient } from "@/apiClient";
import { EnhancedItemType } from "@/components/TablePage/EnhancedTablePage/types/EnhancedItemTypes";
import { getDataPageWithApi } from "@/components/TablePage/EnhancedTablePage/functions/getDataPageWithApi";
import { getTotalCountWithApi } from "@/components/TablePage/EnhancedTablePage/functions/getTotalCountWithApi";

export const ApiIntegrationsTablePage = () => {
    const getHeaderItems = (
        t: TFunction, setSortQuery: (query: string) => void
    ) => createApiIntegrationTableHeader(
        t, (name, position) => {
            const newSortQuery = position ? `${name}:${position}` : '';
            setSortQuery(newSortQuery);
        }
    );

    return (
        <EnhancedTablePage<ApiIntegration, ApiIntegrationTableItem>
            prefix={apiIntegrationsPrefix}
            getDataPageFunctions={{
                getDataPage: (prefix, params) => getDataPageWithApi(prefix, integrationApiClient, params),
                getTotalCount: (prefix, params) => getTotalCountWithApi(prefix, integrationApiClient, params),
            }}
            getHeaderItems={getHeaderItems}
            transformData={mapApiIntegrationToTable}
            itemKeys={[
                { name: 'name', type: EnhancedItemType.Text },
                { name: 'status', type: EnhancedItemType.Text },
                { name: 'user', type: EnhancedItemType.Text },
                { name: 'createdAt', type: EnhancedItemType.Text },
            ]}
        />
    );
};