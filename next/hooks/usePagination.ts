import { RemoveStateCallbacks, SetStateCallbacks } from "@/types/StateCallback";
import { IPagination } from "@/types/Pagination";
import { useState, useEffect } from "react";
import { useStateUpdate } from "./useStateUpdate";
import { DataPageHook } from "@/types/DataPageHook";
import { Identifiable } from "@/types/Identifiable";

export const usePagination = <T extends Identifiable>({
    itemsPerPage,
    searchQuery,
    sortQuery,
    getDataPageHook,
    setStateCallbacks,
    removeStateCallbacks
}: {
    itemsPerPage: number;
    getDataPageHook: DataPageHook<T>;
    searchQuery: string;
    sortQuery?: string;
    setStateCallbacks?: SetStateCallbacks<T>;
    removeStateCallbacks?: RemoveStateCallbacks<T>;
}): IPagination<T> => {
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState<T[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const { getDataPage, getTotalCount } = getDataPageHook;

    if (setStateCallbacks && removeStateCallbacks) {
        useStateUpdate<T>(searchQuery, setData, setStateCallbacks, removeStateCallbacks);
    }

    useEffect(() => {
        const fetchData = async () => {
            const dataPage = await getDataPage({ page: currentPage, pageSize: itemsPerPage, searchQuery, sortQuery });
            setData(dataPage);

            const count = await getTotalCount({ searchQuery });
            setTotalCount(count);
            setTotalPages(Math.ceil(count / itemsPerPage));
        };

        fetchData();
    }, [currentPage, itemsPerPage, searchQuery, sortQuery]);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prevPage => prevPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prevPage => prevPage - 1);
        }
    };

    return {
        data,
        currentPage,
        totalPages,
        totalCount,
        handleNextPage,
        handlePreviousPage,
    };
};
