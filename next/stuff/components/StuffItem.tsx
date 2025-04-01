"use client";
import { Input } from "@/components/InputBox/Input";
import { Stuff } from "../types/Stuff";
import styles from "./StuffUpload.module.css";
import { useIcon, IconKey } from "@/hooks/useIcon";
import cn from "classnames";

type StuffItemProps = {
    stuff: Stuff;
    onClear?: (stuff: Stuff) => void;
    onDownload?: () => void;
};

export const StuffItem = ({ stuff, onClear, onDownload }: StuffItemProps) => {
    const icon = useIcon(stuff.type as IconKey);

    return (
        <Input
            type='text'
            value={stuff.value || stuff.file?.name || ''}
            className={cn(styles.inputContainer, {
                [styles.downloadable]: onDownload
            })}
            inputClassName={styles.input}
            icon={icon}
            onClick={onDownload}
            readOnly={true}
            extraContent={_ =>
                onClear ? (<span className={cn(styles.inputExtraContentContainer, styles.stuffItem, {
                    [styles.inputExtraContentContainerNotFocused]: true,
                })}>
                    <span className={styles.clearInput} onClick={() => onClear(stuff)}>
                        <span className={styles.clearInputIcon}>+</span>
                    </span>
                </span>) : null
            }
        />
    );
};