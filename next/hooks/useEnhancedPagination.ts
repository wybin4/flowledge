import { usePrivateSetting } from "@/private-settings/hooks/usePrivateSetting";
import { GetDataPage } from "@/types/GetDataPage";
import { Identifiable } from "@/types/Identifiable";
import { useGetItems } from "./useGetItems";
import { PaginationHook, usePagination } from "./usePagination";
import { DataPageHookFunctions } from "@/types/DataPageHook";

export const useEnhancedPagination = <T extends Identifiable,>({
    searchQuery, sortQuery, queryParams, apiPrefix, getDataPageFunctions,
    setStateCallbacks, removeStateCallbacks
}: {
    apiPrefix: string;
    getDataPageFunctions: DataPageHookFunctions<T>;
} & PaginationHook<T>) => {
    const itemsPerPage = usePrivateSetting<number>('search.page-size') || 10;

    const getDataPageHook =
        (paginationProps: GetDataPage) => useGetItems<T>(
            apiPrefix,
            getDataPageFunctions,
            paginationProps
        );

    return usePagination<T>({
        itemsPerPage,
        getDataPageHook,
        searchQuery,
        sortQuery,
        queryParams,
        setStateCallbacks,
        removeStateCallbacks
    });
};