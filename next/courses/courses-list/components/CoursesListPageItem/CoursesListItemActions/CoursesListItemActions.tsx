import { useIcon } from "@/hooks/useIcon";
import styles from "./CoursesListItemActions.module.css";
import cn from "classnames";
import { useTranslation } from "react-i18next";

type CoursesListItemActionsProps = {
    isFavorite: boolean;
    setIsFavorite: (isFavorite: boolean) => void;
    className?: string;
    isExpanded?: boolean;
}

export const CoursesListItemActions = ({ isFavorite, setIsFavorite, className, isExpanded = false }: CoursesListItemActionsProps) => {
    const markIcon = useIcon('mark');
    const unmarkIcon = useIcon('unmark');
    const { t } = useTranslation();

    return (
        <div className={cn(styles.actions, className)}>
            <div className={cn(styles.action, isFavorite && styles.actionActive)} onClick={(e) => {
                e.stopPropagation();
                setIsFavorite(!isFavorite);
            }}>
                {isFavorite ? unmarkIcon : markIcon}{isExpanded &&
                    <span className={styles.actionText}>
                        {isFavorite ? t('unmark-as-favorite') : t('mark-as-favorite')}
                    </span>
                }
            </div>
        </div>
    );
};
