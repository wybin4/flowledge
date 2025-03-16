import { useTranslation } from "react-i18next";
import styles from "./FiniteSelector.module.css";
import cn from "classnames";

type FiniteSelectorProps = {
    value: string;
    selectedValue: string;
    label: string;
    onClick: () => void;
    className?: string;
};

export const FiniteSelector = ({ value, selectedValue, label, onClick, className }: FiniteSelectorProps) => {
    const { t } = useTranslation();

    return (
        <div
            className={cn(styles.item, className, {
                [styles.active]: value === selectedValue
            })}
            onClick={() => onClick()}
        >
            {t(label)}
        </div>
    );
};