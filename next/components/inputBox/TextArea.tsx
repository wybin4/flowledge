import { ChangeEvent } from "react";
import styles from "./InputBox.module.css";
import cn from "classnames";

type TextAreaProps = {
    value: string;
    onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
    textAreaClassName?: string;
};

export const TextArea = ({ value, textAreaClassName, onChange }: TextAreaProps) => {
    return (
        <textarea
            value={value}
            onChange={onChange}
            className={cn(styles.textarea, textAreaClassName)}
        ></textarea>
    );
};