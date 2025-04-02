import { useIcon } from "@/hooks/useIcon";
import { ReactNode } from "react";
import styles from "./TablePage.module.css";
import { IPagination } from "@/types/Pagination";
import cn from "classnames";
import { useTranslation } from "react-i18next";

type TablePageProps<T> = {
    header: ReactNode;
    body: ReactNode;
    pagination: Omit<IPagination<T>, 'data'>;
    bodyStyles?: string;
    tableStyles?: string;
};

export const TablePage = <T,>({ header, body, pagination, bodyStyles, tableStyles }: TablePageProps<T>) => {
    const iconRight = useIcon('right');
    const iconLeft = useIcon('left');
    const iconNothing = useIcon('nothing');
    const { t } = useTranslation();

    if (pagination.totalCount === 0) {
        return (
            <div className={styles.nothingContainer}>
                <div>{iconNothing}</div>
                <h2>{t('nothing-found')}</h2>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div data-pagination='left' className={cn(styles.button, styles.buttonLeft, {
                [styles.disabled]: pagination.currentPage === 1
            })}>
                <div>{pagination.currentPage - 1}/{pagination.totalPages}</div>
                <div onClick={pagination.handlePreviousPage}>{iconLeft}</div>
            </div>
            <table className={cn(styles.table, tableStyles)}>
                {header}
                <tbody className={bodyStyles}>
                    {body}
                </tbody>
            </table>
            <div data-pagination='right' className={cn(styles.button, styles.buttonRight, 'tablePaginationButtonRight', {
                [styles.disabled]: pagination.currentPage === pagination.totalPages
            })}>
                <div>{pagination.currentPage + 1}/{pagination.totalPages}</div>
                <div onClick={pagination.handleNextPage}>{iconRight}</div>
            </div>
        </div>
    );
};