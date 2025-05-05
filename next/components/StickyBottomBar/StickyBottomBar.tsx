import { ReactNode } from "react";
import styles from "./StickyBottomBar.module.css";

type StickyBottomBarProps = {
    children: ReactNode;
    barContent: ReactNode;
};

export const StickyBottomBar = ({ barContent, children }: StickyBottomBarProps) => {
    return (
        <div className={styles.container}>
            <div>{children}</div>
            <div className={styles.barContent}>{barContent}</div>
        </div>
    );
};