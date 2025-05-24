import React from "react";
import styles from "./ProgressBar.module.css";
import cn from "classnames";
import { ItemSize } from "@/types/ItemSize";

interface ProgressBarProps {
    progress: number;
    withWrapper?: boolean;
    size?: ItemSize;
}

const ProgressBar = ({ progress, withWrapper = false, size = ItemSize.Little }: ProgressBarProps) => {
    return (
        <div className={cn(styles.container, styles[size], {
            [styles.wrapper]: withWrapper
        })}>
            <div>{Math.round(progress * 100) / 100}%</div>
            <div className={styles.progressBarContainer}>
                <div
                    className={styles.progressBarFill}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

export default ProgressBar;