import { neuralApiClient } from "@/apiClient";
import { useCallback } from "react";
import { ApiIntegration } from "../types/ApiIntegration";

export const useGetApiIntegration = (setApiIntegration: (apiIntegration: ApiIntegration) => void) => {
    const getApiIntegration = useCallback(async (_id: string) => {
        const apiIntegration = await neuralApiClient<ApiIntegration>(`api-integrations/${_id}`);
        setApiIntegration(apiIntegration);
    }, [setApiIntegration]);

    return getApiIntegration;
};