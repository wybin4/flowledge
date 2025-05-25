import styles from "./TablePage.module.css";
import cn from "classnames";
import { JSX } from "react";

type TablePageSearchProps = {
    query: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
    iconClassName?: string;
    icon?: JSX.Element;
};

export const TablePageSearch = ({ query, icon, iconClassName, onChange, placeholder, className }: TablePageSearchProps) => {
    return (
        <div className={styles.inputContainer}>
            <input
                className={cn(styles.input, className, {
                    [styles.inputWithIcon]: icon
                })}
                type="text"
                value={query}
                onChange={onChange}
                placeholder={placeholder}
            />
            <div className={cn(styles.icon, iconClassName)}>{icon}</div>
        </div>
    );
};