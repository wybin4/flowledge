import { useTranslation } from "react-i18next";
import styles from "./FiniteSelector.module.css";
import cn from "classnames";

type FiniteSelectorProps = {
    value: string;
    selectedValue: string;
    label: string;
    onClick: () => void;
};

export const FiniteSelector = ({ value, selectedValue, label, onClick }: FiniteSelectorProps) => {
    const { t } = useTranslation();

    return (
        <div
            className={cn(styles.item, {
                [styles.active]: value === selectedValue
            })}
            onClick={() => onClick()}
        >
            {t(label)}
        </div>
    );
};