"use client";
import { HTMLProps } from "react";
import styles from "./InputBox.module.css";
import cn from "classnames";

export const InputBoxWrapper: React.FC<HTMLProps<HTMLDivElement>> = ({ children, className, disabled }) => {
    return (
        <div className={cn(styles.container, className, {
            [styles.inputWrapperDisabled]: disabled
        })}>
            {children}
        </div>
    );
};
