import { useIcon } from "@/hooks/useIcon";
import styles from "./CoursesListItemActions.module.css";
import cn from "classnames";
import { useTranslation } from "react-i18next";

type CoursesListItemActionsProps = {
    isFavourite: boolean;
    setIsFavourite: (isFavourite: boolean) => void;
    className?: string;
    isExpanded?: boolean;
}

export const CoursesListItemActions = ({ isFavourite, setIsFavourite, className, isExpanded = false }: CoursesListItemActionsProps) => {
    const markIcon = useIcon('mark');
    const unmarkIcon = useIcon('unmark');
    const { t } = useTranslation();

    return (
        <div className={cn(styles.actions, className)}>
            <div className={cn(styles.action, isFavourite && styles.actionActive)} onClick={(e) => {
                e.stopPropagation();
                setIsFavourite(!isFavourite);
            }}>
                {isFavourite ? unmarkIcon : markIcon}{isExpanded &&
                    <span className={styles.actionText}>
                        {isFavourite ? t('unmark-as-favourite') : t('mark-as-favourite')}
                    </span>
                }
            </div>
        </div>
    );
};
