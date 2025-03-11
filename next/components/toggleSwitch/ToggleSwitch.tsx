import React, { useState } from "react";
import styles from "./ToggleSwitch.module.css";

export const ToggleSwitch = () => {
    const [isOn, setIsOn] = useState<boolean>(false);

    const toggleSwitch = () => setIsOn(!isOn);

    return (
        <div className={styles.container}>
            <label className={styles.switch}>
                <input
                    type='checkbox'
                    checked={isOn}
                    onChange={toggleSwitch}
                />
                <span className={styles.slider} />
            </label>
        </div>
    );
};
