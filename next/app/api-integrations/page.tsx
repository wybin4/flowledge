"use client";

import { ApiIntegrationItem } from "@/api-integrations/components/ApiIntegrationItem/ApiIntegrationItem";
import { ApiIntegrationsTablePage } from "@/api-integrations/components/ApiIntegrationsTablePage/ApiIntegrationsTablePage";
import { ApiIntegrationMode } from "@/api-integrations/types/ApiIntegrationMode";

export default async function ApiIntegrationsPage({ searchParams }: { searchParams: { mode?: string } }) {
    const { mode } = await searchParams;

    if (mode === ApiIntegrationMode.CREATE) {
        return <ApiIntegrationItem mode={mode as ApiIntegrationMode} />;
    }

    return <ApiIntegrationsTablePage />;
}