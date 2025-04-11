import { ApiClientMethods } from "@/apiClient";
import { GetTotalCountPage } from "@/types/GetTotalCountPage";

export const getTotalCountWithApi = async (prefix: string, apiClient: ApiClientMethods, { searchQuery }: GetTotalCountPage) => {
    const response = await apiClient.get<number>(`${prefix}.count?searchQuery=${searchQuery}`);
    return typeof response === 'number' ? response : 0;
};