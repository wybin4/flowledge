import { ApiClient } from "@/types/ApiClient";
import { GetTotalCountPage } from "@/types/GetTotalCountPage";

export const getTotalCountWithApi = async (prefix: string, apiClient: ApiClient<number>, { searchQuery }: GetTotalCountPage) => {
    const response = await apiClient<number>({
        url: `${prefix}.count?searchQuery=${searchQuery}`
    });
    return typeof response === 'number' ? response : 0;
};