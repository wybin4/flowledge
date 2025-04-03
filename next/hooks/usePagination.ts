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
    const [currentTotalCount, setCurrentTotalCount] = useState(0);

    const { getDataPage, getTotalCount, dataPage, totalCount } = getDataPageHook;

    if (setStateCallbacks && removeStateCallbacks) {
        useStateUpdate<T>(searchQuery, setData, setStateCallbacks, removeStateCallbacks);
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [newDataPage, newCount] = await Promise.all([
                    getDataPage({ page: currentPage, pageSize: itemsPerPage, searchQuery, sortQuery }),
                    getTotalCount({ searchQuery })
                ]);

                setData(newDataPage);
                setCurrentTotalCount(newCount);
                setTotalPages(Math.ceil(newCount / itemsPerPage));
            } catch (error) {
                setData([]);
                setCurrentTotalCount(0);
                setTotalPages(1);
            }
        };

        fetchData();
    }, [currentPage, itemsPerPage, searchQuery, sortQuery, getDataPage, getTotalCount, dataPage, totalCount]);

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
        totalCount: currentTotalCount,
        handleNextPage,
        handlePreviousPage,
    };
};
