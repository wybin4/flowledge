import { useTranslation } from "react-i18next";
import styles from "./TablePage.module.css";

type TablePageSearchProps = {
    query: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
};

export const TablePageSearch = ({ query, onChange, placeholder }: TablePageSearchProps) => {
    const { t } = useTranslation();

    return (
        <input
            className={styles.input}
            type="text"
            value={query}
            onChange={onChange}
            placeholder={placeholder && t(placeholder)}
        />
    );
};