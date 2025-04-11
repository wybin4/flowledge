import { ApiClientMethods } from "@/apiClient";
import { GetDataPage } from "@/types/GetDataPage";

export const getDataPageWithApi = async<T>(prefix: string, apiClient: ApiClientMethods, { page, pageSize, searchQuery, sortQuery }: GetDataPage) => {
    const response = await apiClient.get<T[]>(`${prefix}.get?page=${page}&pageSize=${pageSize}&searchQuery=${searchQuery}&sortQuery=${sortQuery}`);
    return Array.isArray(response) ? response : [response];
};

