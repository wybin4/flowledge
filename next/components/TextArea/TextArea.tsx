import { ChangeEvent, memo, useState } from "react";
import styles from "./TextArea.module.css";
import cn from "classnames";
import { useIcon } from "@/hooks/useIcon";
import { Modal } from "../Modal/Modal";
import { useTranslation } from "react-i18next";

type TextAreaProps = {
    value: string;
    onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
    textAreaClassName?: string;
    fullScreen?: boolean;
};

export const TextArea = memo(({
    value, onChange,
    fullScreen = false,
    textAreaClassName
}: TextAreaProps) => {
    const fullScreenIcon = useIcon('full-screen');

    const [isFull, setIsFull] = useState<boolean>(false);

    const { t } = useTranslation();

    return (
        <div className={cn(styles.container)}>
            <Modal isOpen={isFull} onClose={() => setIsFull(false)}>
                {onClose => (
                    <>
                        <textarea
                            value={value}
                            onChange={onChange}
                            className={cn(styles.textarea, textAreaClassName, {
                                [styles.fulled]: isFull
                            })}
                        ></textarea>
                        <div className={styles.button} onClick={onClose}>{t('close')}</div>
                    </>
                )}
            </Modal>
            {fullScreen &&
                <div
                    className={styles.fullScreen}
                    onClick={() => setIsFull(!isFull)}
                >
                    {fullScreenIcon}
                </div>
            }
            <textarea
                value={value}
                onChange={onChange}
                className={cn(styles.textarea, textAreaClassName, {
                    [styles.canBeFulled]: fullScreen
                })}
            ></textarea>
        </div>
    );
}, (prevProps, nextProps) => prevProps.value === nextProps.value);