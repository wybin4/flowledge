import { IconKey } from "@/hooks/useIcon";
import { GetDataPage } from "@/types/GetDataPage";
import { ApiClient } from "@/types/ApiClient";

export const getDataPageWithApi = async<T>(prefix: IconKey, apiClient: ApiClient<T>, { page, pageSize, searchQuery, sortQuery }: GetDataPage) => {
    const response = await apiClient<T[]>({
        url: `${prefix}?page=${page}&pageSize=${pageSize}&searchQuery=${searchQuery}&sortQuery=${sortQuery}`
    });
    return Array.isArray(response) ? response : [response];
};

