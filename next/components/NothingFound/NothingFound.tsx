import { useIcon } from "@/hooks/useIcon";
import { useTranslation } from "react-i18next";
import styles from "./NothingFound.module.css";

export const NothingFound = () => {
    const iconNothing = useIcon('sad');
    const { t } = useTranslation();

    return (
        <div className={styles.container}>
            <div className={styles.icon}>{iconNothing}</div>
            <h2>{t('nothing-found')}</h2>
        </div>
    );
};