import { togetherSortIcon } from "@/helpers/sortIcon";
import cn from "classnames";
import styles from "./TopBottomIcon.module.css";
import { TopBottomPosition } from "@/types/Sortable";
import { useIcon } from "@/hooks/useIcon";

type TopBottomIconProps = {
    state?: TopBottomPosition,
    onClick?: (icon?: TopBottomPosition) => void,
    mode?: 'separate' | 'together'
}

export const TopBottomIcon = ({ state, onClick, mode = 'together' }: TopBottomIconProps) => {
    const topIcon = useIcon('top');
    const bottomIcon = useIcon('bottom');
    const isSeparate = mode === 'separate';

    return (
        <span onClick={!isSeparate ? () => onClick?.() : undefined} className={cn(styles.icon, {
            [styles.iconTop]: state === TopBottomPosition.TOP,
            [styles.iconBottom]: state === TopBottomPosition.BOTTOM,
            [styles.iconTogether]: !isSeparate
        })}>
            {isSeparate ?
                <div className={styles.separateIcon}>
                    <span onClick={() => onClick?.(TopBottomPosition.TOP)}>{topIcon}</span>
                    <span onClick={() => onClick?.(TopBottomPosition.BOTTOM)}>{bottomIcon}</span>
                </div>
                : togetherSortIcon
            }
        </span>
    );
}
