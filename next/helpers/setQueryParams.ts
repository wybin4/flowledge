import { QueryParams } from "@/types/QueryParams";

export const setQueryParams = (queryParams?: QueryParams) => {
    if (!queryParams) return '';
    return `?${Object.entries(queryParams).map(([key, value]) => `${key}=${value}`).join('&')}`;
};