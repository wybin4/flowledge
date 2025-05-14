import { useIcon } from "@/hooks/useIcon";
import cn from "classnames";
import styles from "./TablePage.module.css";
import { ReactNode } from "react";

type TablePagePaginationProps = {
    currentPage: number;
    totalPages: number;
    handlePreviousPage: () => void;
    handleNextPage: () => void;
    hideRightButton?: boolean;
    rightButton?: ReactNode;
    onRightButtonClick?: () => void;
};

export const TablePagePagination = ({
    currentPage, totalPages,
    handlePreviousPage, handleNextPage,
    hideRightButton = false, rightButton, onRightButtonClick
}: TablePagePaginationProps) => {
    const iconRight = useIcon('right');
    const iconLeft = useIcon('left');

    return (
        <div className={styles.container}>
            <div
                data-pagination='left'
                className={cn(styles.button, styles.buttonLeft, {
                    [styles.disabled]: currentPage === 1
                })}
                onClick={handlePreviousPage}
            >
                <div>{currentPage - 1}/{totalPages}</div>
                <div>{iconLeft}</div>
            </div>
            {!hideRightButton && (
                <div
                    data-pagination='right'
                    className={cn(styles.button, styles.buttonRight, {
                        [styles.disabled]: rightButton ? false : currentPage === totalPages
                    })}
                    onClick={onRightButtonClick ? onRightButtonClick : handleNextPage}
                >
                    {!rightButton && <div>{currentPage + 1}/{totalPages}</div>}
                    <div>{iconRight}</div>
                    {rightButton}
                </div>
            )}
        </div>
    );
};