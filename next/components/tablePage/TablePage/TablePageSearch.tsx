import { useTranslation } from "react-i18next";
import styles from "./TablePage.module.css";
import cn from "classnames";

type TablePageSearchProps = {
    query: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
};

export const TablePageSearch = ({ query, onChange, placeholder, className }: TablePageSearchProps) => {
    const { t } = useTranslation();

    return (
        <input
            className={cn(styles.input, className)}
            type="text"
            value={query}
            onChange={onChange}
            placeholder={placeholder && t(placeholder)}
        />
    );
};