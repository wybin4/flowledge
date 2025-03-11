"use client";
import styles from "./InputBox.module.css";

export const InputBoxWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className={styles.container}>
            {children}
        </div>
    );
};
