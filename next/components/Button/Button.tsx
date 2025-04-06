import { useTranslation } from "react-i18next";
import cn from "classnames";
import styles from "./Button.module.css";
import { FillBorderUnderlineMode } from "@/types/FillBorderUnderlineMode";

type ButtonProps = {
    onClick: () => void;
    prefix: string;
    type: ButtonType;
    title?: string;
    disabled?: boolean;
    mode?: FillBorderUnderlineMode;
};

export enum ButtonType {
    DELETE = 'delete',
    EDIT = 'edit',
    SAVE = 'save'
}

export const Button = ({ onClick, prefix, type, title, disabled, mode = FillBorderUnderlineMode.FILL }: ButtonProps) => {
    const { t } = useTranslation();
    return <button className={cn(styles.button, styles[type], disabled && styles.disabled, styles[mode])} onClick={onClick}>
        {title ? title : t(`${prefix}.${type}`)}
    </button>
};