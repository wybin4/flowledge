import { ApiClientMethods } from "@/apiClient";
import { setQueryParams } from "@/helpers/setQueryParams";
import { QueryParams } from "@/types/QueryParams";

export const useGetItem = <T,>(
    prefix: string,
    apiClient: ApiClientMethods,
    id: string,
    queryParams?: QueryParams
) => apiClient.get<T>(`${prefix}.get/${id}${queryParams ? setQueryParams(queryParams) : ""}`);