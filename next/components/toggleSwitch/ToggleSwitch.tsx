import React, { useState } from "react";
import styles from "./ToggleSwitch.module.css";

type ToggleSwitchProps = {
    isChecked: boolean;
    onToggle: () => void;
};

export const ToggleSwitch = ({ isChecked, onToggle }: ToggleSwitchProps) => {
    return (
        <div className={styles.container}>
            <label className={styles.switch}>
                <input
                    type='checkbox'
                    checked={isChecked}
                    onChange={onToggle}
                />
                <span className={styles.slider} />
            </label>
        </div>
    );
};
