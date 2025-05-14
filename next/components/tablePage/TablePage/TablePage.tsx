import { ReactNode } from "react";
import styles from "./TablePage.module.css";
import { IPagination } from "@/types/Pagination";
import cn from "classnames";
import { NothingFound } from "@/components/NothingFound/NothingFound";
import { TablePagePagination } from "./TablePagePagination";

type TablePageProps<T> = {
    header: ReactNode;
    body: ReactNode;
    pagination: Omit<IPagination<T>, 'data'>;
    bodyStyles?: string;
    tableStyles?: string;
};

export const TablePage = <T,>({ header, body, pagination, bodyStyles, tableStyles }: TablePageProps<T>) => {
    if (pagination.totalCount === 0) {
        return (<NothingFound />);
    }

    return (
        <div className={styles.container}>
            <TablePagePagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                handlePreviousPage={pagination.handlePreviousPage}
                handleNextPage={pagination.handleNextPage}
            />
            <table className={cn(styles.table, tableStyles)}>
                {header}
                <tbody className={bodyStyles}>
                    {body}
                </tbody>
            </table>
        </div>
    );
};