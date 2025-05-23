import { ReactNode } from "react";
import styles from "./StickyBottomBar.module.css";
import cn from "classnames";

type StickyBottomBarProps = {
    children: ReactNode;
    barContent: ReactNode;
    className?: string;
};

export const StickyBottomBar = ({ barContent, children, className }: StickyBottomBarProps) => {
    return (
        <div className={cn(styles.container, className)}>
            <div>{children}</div>
            <div className={styles.barContent}>{barContent}</div>
        </div>
    );
};