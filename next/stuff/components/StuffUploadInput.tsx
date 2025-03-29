import { Input } from "@/components/InputBox/Input";
import { StuffTypes } from "../types/StuffTypes";
import { IconKey, useIcon } from "@/hooks/useIcon";
import { useTranslation } from "react-i18next";
import styles from "./StuffUpload.module.css";
import { useEffect, useState } from "react";
import cn from "classnames";
import { isValidUrl } from "@/helpers/isValidUrl";
import { Stuff } from "../types/Stuff";
import { generateRandomId } from "@/helpers/generateRandomId";
import FileUploader from "@/components/FileUploader/FileUploader";
import { usePrivateSetting } from "@/private-settings/hooks/usePrivateSetting";

type StuffUploadInputProps = {
    type: StuffTypes;
    i18nPrefix: string;
    onAccept: (value: Stuff) => void;
};

export const StuffUploadInput = ({ type, i18nPrefix, onAccept }: StuffUploadInputProps) => {
    const inputIcon = useIcon(type as IconKey);
    const acceptIcon = useIcon('accept');
    const { t } = useTranslation();
    const isLink = type === StuffTypes.Link;

    const [value, setValue] = useState<string>('');
    const [isFocused, setIsFocused] = useState<boolean>(false);

    const linkRestrictions = usePrivateSetting<string>('security.link-restrictions') || '';
    const allowedTypes = usePrivateSetting<string>(`file-upload.stuff.${type}`) || '*';

    const isValidLink = type === StuffTypes.Link && isValidUrl(value, linkRestrictions);

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const handleValue = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value)
    };

    const handleClear = () => setValue('');

    return (
        <div
            tabIndex={0}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={cn({
                [styles.pointer]: !isLink
            })}
        >
            <FileUploader
                onFileUpload={(file) => onAccept({ type, file, _id: generateRandomId() })}
                allowedTypes={allowedTypes}
                input={(onClick) => (
                    <Input
                        type='text'
                        value={value}
                        onChange={isLink ? handleValue : undefined}
                        onClick={!isLink ? onClick : undefined}
                        className={styles.inputContainer}
                        inputClassName={cn(styles.input, {
                            [styles.inputInputFocused]: isFocused
                        })}
                        icon={inputIcon}
                        placeholder={
                            isLink ?
                                t(`${i18nPrefix}.${type}.placeholder`) :
                                `${t(`${i18nPrefix}.placeholder`)} ${allowedTypes}`
                        }
                        readOnly={!isLink}
                        extraContent={focused =>
                            <span className={cn(styles.inputExtraContentContainer, {
                                [styles.inputExtraContentContainerNotFocused]: !(isFocused && isValidLink),
                                [styles.inputFocused]: focused,
                                [styles.empty]: value === ''
                            })}>
                                <span className={styles.clearInput} onClick={handleClear}>
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
                )} />
        </div>
    );
};