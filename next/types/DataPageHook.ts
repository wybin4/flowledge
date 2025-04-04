import { GetDataPage } from "./GetDataPage";
import { GetTotalCountPage } from "./GetTotalCountPage";
import { IconKey } from "@/hooks/useIcon";

export type DataPageHook<T> = {
    data: T[];
    totalCount: number;
    isLoading: boolean;
};

export type DataPageHookFunctions<T> = {
    getDataPage: (prefix: IconKey, params: GetDataPage) => Promise<T[]> | T[];
    getTotalCount: (prefix: IconKey, params: GetTotalCountPage) => Promise<number> | number;
};
