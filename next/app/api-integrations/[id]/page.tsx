import { ApiIntegrationItem } from "@/api-integrations/components/ApiIntegrationItem/ApiIntegrationItem";
import { ApiIntegrationMode } from "@/api-integrations/types/ApiIntegrationMode";

export default async function ApiIntegrationPage({ params, searchParams }: { params: { id: string }, searchParams: { mode?: string } }) {
    const { id } = await params;
    const { mode } = await searchParams;

    return (
        <ApiIntegrationItem _id={id} mode={mode as ApiIntegrationMode} />
    );
}
