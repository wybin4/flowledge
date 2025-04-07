import { GetDataPage } from "@/types/GetDataPage";
import { ApiClient } from "@/types/ApiClient";

export const getDataPageWithApi = async<T>(prefix: string, apiClient: ApiClient<T>, { page, pageSize, searchQuery, sortQuery }: GetDataPage) => {
    const response = await apiClient<T[]>({
        url: `${prefix}.get?page=${page}&pageSize=${pageSize}&searchQuery=${searchQuery}&sortQuery=${sortQuery}`
    });
    return Array.isArray(response) ? response : [response];
};

