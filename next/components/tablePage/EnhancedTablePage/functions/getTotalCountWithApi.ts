import { IconKey } from "@/hooks/useIcon";
import { ApiClient } from "@/types/ApiClient";
import { GetTotalCountPage } from "@/types/GetTotalCountPage";

export const getTotalCountWithApi = async (prefix: IconKey, apiClient: ApiClient<number>, { searchQuery }: GetTotalCountPage) => {
    const response = await apiClient<number>({
        url: `${prefix}/count?searchQuery=${searchQuery}`
    });
    return typeof response === 'number' ? response : 0;
};