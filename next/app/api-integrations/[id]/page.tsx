import { ApiIntegrationItem } from "@/api-integrations/components/ApiIntegrationItem/ApiIntegrationItem";
import { ApiIntegrationMode } from "@/api-integrations/types/ApiIntegrationMode";

export default async function ApiIntegrationPage({ params }: { params: { id: string } }) {
    const { id } = await params;

    return (
        <ApiIntegrationItem _id={id} mode={ApiIntegrationMode.CREATE} />
    );
}
