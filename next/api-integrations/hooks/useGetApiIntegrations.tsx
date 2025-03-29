import { neuralApiClient } from "@/apiClient";
import { useCallback } from "react";
import { ApiIntegration } from "../types/ApiIntegration";

export const useGetApiIntegrations = () => {
    const getDataPage = useCallback(async (page: number, pageSize: number, searchQuery?: string, sortQuery?: string) => {
        const response = await neuralApiClient<ApiIntegration[]>(
            `api-integrations?page=${page}&pageSize=${pageSize}&searchQuery=${searchQuery}&sortQuery=${sortQuery}`
        );
        return response;
    }, []);

    const getTotalCount = useCallback(async (searchQuery?: string) => {
        const response = await neuralApiClient<number>(`api-integrations/count?searchQuery=${searchQuery}`);
        return response;
    }, []);

    return { getDataPage, getTotalCount };
};