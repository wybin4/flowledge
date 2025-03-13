"use client";
import { Input } from "@/components/inputBox/Input";
import { Stuff } from "../types/Stuff";
import styles from "./StuffUpload.module.css";
import { useIcon, IconKey } from "@/hooks/useIcon";
import cn from "classnames";

type StuffItemProps = {
    stuff: Stuff;
    onClear: (stuff: Stuff) => void;
};

export const StuffItem = ({ stuff, onClear }: StuffItemProps) => {
    const icon = useIcon(stuff.type as IconKey);
    return (
        <Input
            type='text'
            value={stuff.value || stuff.file?.name || ''}
            className={styles.inputContainer}
            inputClassName={styles.input}
            disabled={true}
            icon={icon}
            extraContent={_ =>
                <span className={cn(styles.inputExtraContentContainer, styles.stuffItem, {
                    [styles.inputExtraContentContainerNotFocused]: true,
                })}>
                    <span className={styles.clearInput} onClick={() => onClear(stuff)}>
                        <span className={styles.clearInputIcon}>+</span>
                    </span>
                </span>
            }
        />
    );
};