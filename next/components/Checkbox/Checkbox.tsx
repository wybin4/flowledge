import { useState } from "react";
import styles from "./Checkbox.module.css";

type CheckboxProps = {
    label: string;
};

export const Checkbox = ({ label }: CheckboxProps) => {
    const [checked, setChecked] = useState<boolean>(false);

    const handleCheckboxChange = () => {
        setChecked(!checked);
    };

    return (
        <label className={styles.checkboxContainer}>
            {label}
            <input type='checkbox' checked={checked} onChange={handleCheckboxChange} />
            <span className={styles.checkmark}></span>
        </label>
    );
};