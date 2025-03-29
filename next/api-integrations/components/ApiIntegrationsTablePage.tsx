"use client";

import { ApiIntegration } from "../types/ApiIntegration";
import { mapApiIntegrationToTable } from "@/api-integrations/functions/mapApiIntegrationToTable";
import { createApiIntegrationTableHeader } from "@/api-integrations/functions/createApiIntegrationTableHeader";
import { apiIntegrationsPrefix } from "@/helpers/prefixes";
import { EnhancedTablePage } from "@/components/TablePage/EnhancedTablePage/EnhancedTablePage";
import { TFunction } from "i18next";
import { ApiIntegrationTableItem } from "@/api-integrations/types/ApiIntegrationTableItem";
import { neuralApiClient } from "@/apiClient";

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
            itemKeys={['name', 'status', 'user', 'createdAt']}
            apiClient={neuralApiClient}
        />
    );
};