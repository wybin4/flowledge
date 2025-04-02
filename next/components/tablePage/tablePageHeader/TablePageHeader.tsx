import { useTranslation } from "react-i18next";
import styles from "./TablePageHeader.module.css";
import cn from "classnames";
import { useState } from "react";
import { Sortable, SortablePosition } from "@/types/Sortable";

type TablePageHeaderProps = {
    title?: string;
    items: Sortable[];
    isTranslated?: boolean;
    align?: 'left' | 'center' | 'right';
    className?: string;
};

const sortIcon = <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.7206 10.2206L8.50307 13.4456L5.28557 10.2206C5.14434 10.0793 4.95279 10 4.75307 10C4.55334 10 4.3618 10.0793 4.22057 10.2206C4.07934 10.3618 4 10.5533 4 10.7531C4 10.9528 4.07934 11.1443 4.22057 11.2856L7.97057 15.0356C8.04029 15.1059 8.12324 15.1617 8.21464 15.1997C8.30603 15.2378 8.40406 15.2574 8.50307 15.2574C8.60208 15.2574 8.70011 15.2378 8.7915 15.1997C8.8829 15.1617 8.96585 15.1059 9.03557 15.0356L12.7856 11.2856C12.8555 11.2156 12.911 11.1326 12.9488 11.0413C12.9867 10.9499 13.0061 10.852 13.0061 10.7531C13.0061 10.6542 12.9867 10.5562 12.9488 10.4649C12.911 10.3735 12.8555 10.2905 12.7856 10.2206C12.7156 10.1506 12.6326 10.0952 12.5413 10.0573C12.4499 10.0195 12.352 10 12.2531 10C12.1542 10 12.0562 10.0195 11.9649 10.0573C11.8735 10.0952 11.7905 10.1506 11.7206 10.2206Z" fill="currentColor" />
    <path d="M5.28557 7.03685L8.50307 3.81185L11.7206 7.03685C11.7903 7.10715 11.8732 7.16294 11.9646 7.20102C12.056 7.23909 12.1541 7.2587 12.2531 7.2587C12.3521 7.2587 12.4501 7.23909 12.5415 7.20102C12.6329 7.16294 12.7158 7.10715 12.7856 7.03685C12.8559 6.96713 12.9117 6.88418 12.9497 6.79278C12.9878 6.70139 13.0074 6.60336 13.0074 6.50435C13.0074 6.40534 12.9878 6.30731 12.9497 6.21592C12.9117 6.12452 12.8559 6.04157 12.7856 5.97185L9.03557 2.22185C8.96585 2.15155 8.8829 2.09576 8.7915 2.05768C8.70011 2.0196 8.60208 2 8.50307 2C8.40406 2 8.30603 2.0196 8.21464 2.05768C8.12324 2.09576 8.04029 2.15155 7.97057 2.22185L4.22057 5.97185C4.15064 6.04178 4.09517 6.1248 4.05732 6.21616C4.01948 6.30753 4 6.40545 4 6.50435C4 6.70408 4.07934 6.89562 4.22057 7.03685C4.3618 7.17808 4.55334 7.25742 4.75307 7.25742C4.95279 7.25742 5.14434 7.17808 5.28557 7.03685Z" fill="currentColor" />
</svg>;

export const TablePageHeader = ({ title, items, isTranslated = false, align = 'center', className }: TablePageHeaderProps) => {
    const { t } = useTranslation();
    const [sortState, setSortState] = useState<SortablePosition | undefined>(undefined);

    const handleSortTop = (item: Sortable) => {
        let newSortState = sortState;
        if (sortState === SortablePosition.TOP) {
            newSortState = SortablePosition.BOTTOM;
        } else if (sortState === SortablePosition.BOTTOM) {
            newSortState = undefined;
        } else {
            newSortState = SortablePosition.TOP;
        }
        item.onSort?.(newSortState);
        setSortState(newSortState);
    }

    return (
        <thead>
            <tr>
                {title && <th className={styles.name}>{t(title)}</th>}
                {items.map(item =>
                    <th
                        key={item.name}
                        onClick={() => handleSortTop(item)}
                        className={cn(styles.header, className)}
                        style={{ textAlign: align }}
                    >
                        <span className={styles.headerContent}>
                            {isTranslated ? t(item.name) : item.name}{item.isSortable &&
                                <span className={cn(styles.iconSort, {
                                    [styles.iconSortTop]: sortState === SortablePosition.TOP,
                                    [styles.iconSortBottom]: sortState === SortablePosition.BOTTOM,
                                })}>
                                    {sortIcon}
                                </span>
                            }
                        </span>
                    </th>
                )}
            </tr>
        </thead>
    );
};