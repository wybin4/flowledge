"use client";
import { CallbackUsage, RemoveStateCallbacks, SetStateCallbacks } from "@/types/StateCallback";
import { IPagination } from "@/types/Pagination";
import { useState, useEffect } from "react";
import { useStateUpdate } from "./useStateUpdate";

export const usePagination = <T extends { _id: string }>({
    itemsPerPage, searchQuery,
    getDataPage, getTotalCount,
    setStateCallbacks, removeStateCallbacks
}: {
    itemsPerPage: number;
    getDataPage: (page: number, limit: number, searchQuery?: string) => T[];
    getTotalCount: (searchQuery?: string) => number;
    searchQuery: string;
    setStateCallbacks: SetStateCallbacks<T>;
    removeStateCallbacks: RemoveStateCallbacks<T>;
}): IPagination<T> => {
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState<T[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    useStateUpdate<T>(searchQuery, setData, setStateCallbacks, removeStateCallbacks);

    useEffect(() => {
        const dataPage = getDataPage(currentPage, itemsPerPage, searchQuery);
        setData(dataPage);

        const count = getTotalCount(searchQuery);
        setTotalCount(count);
        setTotalPages(Math.ceil(count / itemsPerPage));
    }, [currentPage, itemsPerPage, getDataPage, getTotalCount, searchQuery]);

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
