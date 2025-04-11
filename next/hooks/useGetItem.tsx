import { ApiClientMethods } from "@/apiClient";
import { setQueryParams } from "@/helpers/setQueryParams";
import { QueryParams } from "@/types/QueryParams";

export const useGetItem = <T,>(
    prefix: string,
    apiClient: ApiClientMethods,
    _id: string,
    queryParams?: QueryParams
) => apiClient.get<T>(`${prefix}.get/${_id}${queryParams ? setQueryParams(queryParams) : ""}`);