import { GetDataPage } from "./GetDataPage";
import { GetTotalCountPage } from "./GetTotalCountPage";

export type DataPageHook<T> = {
    getDataPage: (params: GetDataPage) => Promise<T[]> | T[];
    getTotalCount: (params: GetTotalCountPage) => Promise<number> | number;
    dataPage?: T[];
    totalCount?: number;
    isLoading: boolean;
};
