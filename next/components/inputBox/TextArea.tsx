import styles from "./InputBox.module.css";
import cn from "classnames";

type TextAreaProps = {
    value: string;
    textAreaClassName?: string;
};

export const TextArea = ({ value, textAreaClassName }: TextAreaProps) => {
    return (
        <textarea value={value}
            className={cn(styles.textarea, textAreaClassName)}
        ></textarea>
    );
};