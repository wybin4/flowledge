import { neuralApiClient } from "@/apiClient";
import { useRouter } from "next/navigation";
import { ApiIntegration } from "../types/ApiIntegration";
import { ApiIntegrationMode } from "../types/ApiIntegrationMode";
import { useCallback } from "react";

export const useSaveApiIntegration = (mode: ApiIntegrationMode, _id?: string) => {
    const router = useRouter();

    const saveApiIntegration = useCallback(async (apiIntegration: ApiIntegration | undefined) => {
        const method = mode === ApiIntegrationMode.CREATE ? 'POST' : 'PUT';
        const url = mode === ApiIntegrationMode.CREATE ? 'api-integrations' : `api-integrations/${_id}`;
        if (apiIntegration) {
            const { name, secret, script, u, enabled } = apiIntegration;
            const body = { name, secret, script, u, enabled };
            console.log(body);
            await neuralApiClient<ApiIntegration>(url, {
                method,
                body: JSON.stringify(body)
            });
            router.push('/api-integrations');
        }
    }, [mode, _id, router]);

    return saveApiIntegration;
};