import { useRouter } from "next/navigation";
import { ApiIntegrationMode } from "@/api-integrations/types/ApiIntegrationMode";
import { ApiIntegrationTableItem } from "@/api-integrations/types/ApiIntegrationTableItem";

interface ApiIntegrationsTablePageItemProps {
    integration: ApiIntegrationTableItem;
}

export const ApiIntegrationsTablePageItem = ({ integration }: ApiIntegrationsTablePageItemProps) => {
    const router = useRouter();
    const onClick = () => router.push(`/api-integrations/${integration._id}?mode=${ApiIntegrationMode.EDIT}`);
    return (
        <tr key={integration._id} onClick={onClick}>
            <td>{integration.name}</td>
            <td>{integration.status}</td>
            <td>{integration.user}</td>
            <td>{integration.createdAt}</td>
        </tr>
    );
};
