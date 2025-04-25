import { QueryParams } from "./QueryParams";

export type GetDataPage = {
    page: number;
    pageSize: number;
    searchQuery?: string;
    sortQuery?: string;
    queryParams?: QueryParams;
};