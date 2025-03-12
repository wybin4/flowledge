import { Input } from "@/components/inputBox/Input";
import { StuffTypes } from "../types/StuffTypes";
import { IconKey, useIcon } from "@/hooks/useIcon";
import { useTranslation } from "react-i18next";
import styles from "./StuffUpload.module.css";
import { useState } from "react";
import cn from "classnames";
import { isValidUrl } from "@/helpers/isValidUrl";
import { Stuff } from "../types/Stuff";
import { generateRandomId } from "@/helpers/generateRandomId";

type StuffUploadInputProps = {
    type: StuffTypes;
    i18nPrefix: string;
    onAccept: (value: Stuff) => void;
};

export const StuffUploadInput = ({ type, i18nPrefix, onAccept }: StuffUploadInputProps) => {
    const inputIcon = useIcon(type as IconKey);
    const acceptIcon = useIcon('accept');
    const { t } = useTranslation();
    const isReadOnly = type !== StuffTypes.Link;
    const [value, setValue] = useState<string>('');
    const isValidLink = type === StuffTypes.Link && isValidUrl(value);
    const [isFocused, setIsFocused] = useState<boolean>(false);

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    return (
        <div
            tabIndex={0}
            onFocus={handleFocus}
            onBlur={handleBlur}
        >
            <Input
                type='text'
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className={styles.inputContainer}
                inputClassName={styles.input}
                icon={inputIcon}
                placeholder={t(`${i18nPrefix}.${type}.placeholder`)}
                readOnly={isReadOnly}
                extraContent={focused =>
                    <span className={cn(styles.inputExtraContentContainer, {
                        [styles.inputExtraContentContainerNotFocused]: !(isFocused && isValidLink),
                        [styles.inputFocused]: focused,
                        [styles.inputExtraContentContainerFocused]: focused,
                        [styles.empty]: value === ''
                    })}>
                        <span className={styles.clearInput} onClick={() => setValue('')}>
                            <span className={styles.clearInputIcon}>+</span>
                        </span>
                        <hr className={styles.lineInput} />
                        <span
                            className={styles.acceptInputIcon}
                            onClick={() => onAccept({ type, value, _id: generateRandomId() })}
                        >
                            {acceptIcon}
                        </span>
                    </span>
                }
            />
        </div>
    );
};