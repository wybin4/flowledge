"use client";
import { HTMLProps } from "react";
import styles from "./InputBox.module.css";
import cn from "classnames";

export const InputBoxWrapper: React.FC<HTMLProps<HTMLDivElement>> = ({ children, className }) => {
    return (
        <div className={cn(styles.container, className)}>
            {children}
        </div>
    );
};
