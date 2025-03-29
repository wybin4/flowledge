import { ApiIntegrationItem } from "@/api-integrations/components/ApiIntegrationItem";
import { ApiIntegrationsTablePage } from "@/api-integrations/components/ApiIntegrationsTablePage";
import { TablePageMode } from "@/types/TablePageMode";

export default async function ApiIntegrationsPage({ searchParams }: { searchParams: { mode?: string } }) {
    const { mode } = await searchParams;

    if (mode === TablePageMode.CREATE) {
        return <ApiIntegrationItem mode={mode as TablePageMode} />;
    }

    return <ApiIntegrationsTablePage />;
}