import { ApiIntegrationItem } from "@/api-integrations/components/ApiIntegrationItem";
import { TablePageMode } from "@/types/TablePageMode";

export default async function ApiIntegrationItemPage({ params, searchParams }: { params: { id: string }, searchParams: { mode?: string } }) {
    const { id } = await params;
    const { mode } = await searchParams;

    return (
        <ApiIntegrationItem mode={mode as TablePageMode} _id={id} />
    );
}
