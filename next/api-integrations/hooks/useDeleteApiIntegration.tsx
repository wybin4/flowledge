import { neuralApiClient } from "@/apiClient";
import { ApiIntegration } from "../types/ApiIntegration";
import { useRouter } from "next/navigation";

import { useCallback } from "react";

export const useDeleteApiIntegration = () => {
    const router = useRouter();

    const deleteApiIntegration = useCallback(async (_id: string) => {
        await neuralApiClient<ApiIntegration>(`api-integrations/${_id}`, {
            method: 'DELETE'
        });
        router.push('/api-integrations');
    }, [router]);

    return deleteApiIntegration;
};