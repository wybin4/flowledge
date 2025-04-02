"use client";

import { ApiIntegration } from "../types/ApiIntegration";
import { mapApiIntegrationToTable } from "@/api-integrations/functions/mapApiIntegrationToTable";
import { createApiIntegrationTableHeader } from "@/api-integrations/functions/createApiIntegrationTableHeader";
import { apiIntegrationsPrefix } from "@/helpers/prefixes";
import { EnhancedTablePage } from "@/components/TablePage/EnhancedTablePage/EnhancedTablePage";
import { TFunction } from "i18next";
import { ApiIntegrationTableItem } from "@/api-integrations/types/ApiIntegrationTableItem";
import { neuralApiClient } from "@/apiClient";
import { EnhancedItemType } from "@/components/TablePage/EnhancedTablePage/types/EnhancedItemTypes";

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
            getHeaderItems={getHeaderItems}
            transformData={mapApiIntegrationToTable}
            itemKeys={[
                { name: 'name', type: EnhancedItemType.Text },
                { name: 'status', type: EnhancedItemType.Text },
                { name: 'user', type: EnhancedItemType.Text },
                { name: 'createdAt', type: EnhancedItemType.Text },
            ]}
            apiClient={neuralApiClient}
        />
    );
};