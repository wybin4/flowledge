import { useTranslation } from "react-i18next";
import styles from "./TablePageHeader.module.css";
import cn from "classnames";
import { useState } from "react";
import { Sortable, TopBottomPosition } from "@/types/Sortable";
import { TopBottomIcon } from "@/components/TopBottomIcon/TopBottomIcon";
import { useTopBottomState } from "@/components/TopBottomIcon/useTopBottomState";

type TablePageHeaderProps = {
    title?: string;
    items: Sortable[];
    isTranslated?: boolean;
    align?: 'left' | 'center' | 'right';
    className?: string;
};

export const TablePageHeader = ({ title, items, isTranslated = false, align = 'center', className }: TablePageHeaderProps) => {
    const { t } = useTranslation();
    const [sortState, setSortState] = useState<TopBottomPosition | undefined>(undefined);

    const handleSortTop = (item: Sortable) => useTopBottomState(sortState, setSortState, item.onSort);

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
                                <TopBottomIcon state={sortState} />
                            }
                        </span>
                    </th>
                )}
            </tr>
        </thead>
    );
};
