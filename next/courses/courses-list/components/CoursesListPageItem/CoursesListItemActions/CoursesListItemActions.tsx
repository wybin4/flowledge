import { useIcon } from "@/hooks/useIcon";
import styles from "./CoursesListItemActions.module.css";
import cn from "classnames";
import { useTranslation } from "react-i18next";

type CoursesListItemActionsProps = {
    isMarked: boolean;
    setIsMarked: (isMarked: boolean) => void;
    className?: string;
    isExpanded?: boolean;
}

export const CoursesListItemActions = ({ isMarked, setIsMarked, className, isExpanded = false }: CoursesListItemActionsProps) => {
    const markIcon = useIcon('mark');
    const unmarkIcon = useIcon('unmark');
    const { t } = useTranslation();

    return (
        <div className={cn(styles.actions, className)}>
            <div className={cn(styles.action, isMarked && styles.actionActive)} onClick={(e) => {
                e.stopPropagation();
                setIsMarked(!isMarked);
            }}>
                {isMarked ? unmarkIcon : markIcon}{isExpanded &&
                    <span className={styles.actionText}>
                        {isMarked ? t('unmark-as-favorite') : t('mark-as-favorite')}
                    </span>
                }
            </div>
        </div>
    );
};
