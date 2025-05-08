import { ApiClientMethods } from "@/apiClient";
import { setQueryParams } from "@/helpers/setQueryParams";
import { GetDataPage } from "@/types/GetDataPage";

export const getDataPageWithApi = async<T>(prefix: string, apiClient: ApiClientMethods, { page, pageSize, searchQuery, sortQuery, queryParams }: GetDataPage) => {
  
    const response = await apiClient.get<T[]>(
        `${prefix}.get${setQueryParams({
            ...queryParams,
            pageSize, page,
            ...(searchQuery ? { searchQuery } : {}),
            ...(sortQuery ? { sortQuery } : {}),
        })}`
    );
    return Array.isArray(response) ? response : [response];
};

