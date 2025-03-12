import { useTranslation } from "react-i18next";
import styles from "./StuffUpload.module.css";
import cn from "classnames";

type StuffUploadButtonProps = {
    text: string;
    isActive: boolean;
    onClick: () => void;
};

export const StuffUploadButton = ({ text, isActive, onClick }: StuffUploadButtonProps) => {
    const { t } = useTranslation();
    return (<div onClick={onClick} className={cn(styles.button, {
        [styles.buttonActive]: isActive
    })}>{(t(text))}</div>);
};