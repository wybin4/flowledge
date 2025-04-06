import React from "react";
import styles from "./ToggleSwitch.module.css";
import cn from "classnames";

type ToggleSwitchProps = {
    isChecked: boolean;
    onToggle: () => void;
    disabled?: boolean;
};

export const ToggleSwitch = ({ isChecked, onToggle, disabled }: ToggleSwitchProps) => {
    return (
        <div className={cn(styles.container, disabled && styles.disabled)}>
            <label className={styles.switch}>
                <input
                    type='checkbox'
                    checked={isChecked}
                    onChange={onToggle}
                    disabled={disabled}
                />
                <span className={styles.slider} />
            </label>
        </div>
    );
};
