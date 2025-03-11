export type IPagination<T> = {
    data: T[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    handleNextPage: () => void;
    handlePreviousPage: () => void;
}