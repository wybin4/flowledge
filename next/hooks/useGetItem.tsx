import { setQueryParams } from "@/helpers/setQueryParams";
import { ApiClient } from "@/types/ApiClient";
import { QueryParams } from "@/types/QueryParams";

export const useGetItem = <T,>(
    prefix: string,
    apiClient: ApiClient<T>,
    _id: string,
    queryParams?: QueryParams
) => apiClient<T>(
    { url: `${prefix}.get/${_id}${queryParams ? setQueryParams(queryParams) : ""}` }
);