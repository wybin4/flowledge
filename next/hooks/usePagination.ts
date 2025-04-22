import { RemoveStateCallbacks, SetStateCallbacks } from "@/types/StateCallback";
import { IPagination } from "@/types/Pagination";
import { useState, useEffect } from "react";
import { DataPageHook } from "@/types/DataPageHook";
import { Identifiable } from "@/types/Identifiable";
import { GetDataPage } from "@/types/GetDataPage";
import { useStateUpdate } from "./useStateUpdate";

export type PaginationHook<T extends Identifiable> = {
    searchQuery: string;
    sortQuery?: string;
    setStateCallbacks?: SetStateCallbacks<T>;
    removeStateCallbacks?: RemoveStateCallbacks<T>;
};

export const usePagination = <T extends Identifiable>({
    itemsPerPage,
    searchQuery,
    sortQuery,
    getDataPageHook,
    setStateCallbacks,
    removeStateCallbacks
}: {
    itemsPerPage: number;
    getDataPageHook: (paginationProps: GetDataPage) => DataPageHook<T>;
} & PaginationHook<T>): IPagination<T> => {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [data, setData] = useState<T[]>([]);

    const { totalCount, data: dataPage } = getDataPageHook(
        { page: currentPage, pageSize: itemsPerPage, searchQuery, sortQuery }
    );

    useEffect(() => {
        setData(dataPage ?? []);
        setTotalPages(Math.ceil(totalCount / itemsPerPage));
    }, [dataPage]);

    if (setStateCallbacks && removeStateCallbacks) {
        useStateUpdate<T>(searchQuery, setData, setStateCallbacks, removeStateCallbacks);
    }

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

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
