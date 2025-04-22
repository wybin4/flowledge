import { GetDataPage } from "./GetDataPage";
import { GetTotalCountPage } from "./GetTotalCountPage";

export type DataPageHook<T> = {
    data: T[];
    totalCount: number;
    isLoading: boolean;
};

export type DataPageHookFunctions<T> = {
    getDataPage: (prefix: string, params: GetDataPage) => Promise<T[]> | T[];
    getTotalCount?: (prefix: string, params: GetTotalCountPage) => Promise<number> | number;
};
