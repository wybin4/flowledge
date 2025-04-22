import { GetDataPage } from "@/types/GetDataPage";
import { DataPageHook, DataPageHookFunctions } from "@/types/DataPageHook";
import { useQuery } from '@tanstack/react-query';

export const useGetItems = <T,>(
    prefix: string,
    { getDataPage, getTotalCount }: DataPageHookFunctions<T>,
    { page, pageSize, searchQuery, sortQuery }: GetDataPage
): DataPageHook<T> => {
    const { data, isLoading: isDataLoading } = useQuery<T[], Error>({
        queryKey: [`${prefix}DataPage`, page, pageSize, searchQuery, sortQuery],
        queryFn: () => getDataPage(prefix, { page, pageSize, searchQuery, sortQuery })
    });

    const { data: totalCount, isLoading: isTotalCountLoading } = useQuery<number, Error>({
        queryKey: [`${prefix}TotalCount`, page, searchQuery],
        queryFn: () => getTotalCount!(prefix, { searchQuery }),
        enabled: !!getTotalCount
    });

    return {
        data: data ?? [],
        totalCount: totalCount ?? 0,
        isLoading: isDataLoading || isTotalCountLoading,
    };
};