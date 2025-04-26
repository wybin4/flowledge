import { useIcon } from "@/hooks/useIcon";
import styles from "./CoursesListHeade.module.css";
import cn from "classnames";

type CoursesListHeaderProps = {
    title: string;
    count: number;
    hasMoreItems?: boolean;
};

export const CoursesListHeader = ({ title, count, hasMoreItems = false }: CoursesListHeaderProps) => {
    const rightArrowIcon = useIcon('right-arrow');

    return (
        <div className={cn(styles.container, {
            [styles.hasMore]: hasMoreItems
        })}>
            <div className={styles.titleContainer}>
                <h3>{title}</h3>
                <div className={styles.count}>{count}</div>
            </div>
            {hasMoreItems && <div className={styles.rightIcon}>{rightArrowIcon}</div>}
        </div>
    );
};
