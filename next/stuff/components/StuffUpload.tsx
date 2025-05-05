"use client";
import { useTranslation } from "react-i18next";
import styles from "./StuffUpload.module.css";
import { Dispatch, SetStateAction, useState } from "react";
import cn from "classnames";
import { StuffUploadButton } from "./StuffUploadButton";
import { StuffTypes } from "../types/StuffTypes";
import { StuffUploadInput } from "./StuffUploadInput";
import { getEnumValueByString } from "@/helpers/getEnumValueByString";
import { Stuff } from "../types/Stuff";
import { StuffItem } from "./StuffItem";

type StuffUploadProps = {
    className?: string;
    stuffList: Stuff[];
    setStuffList: (stuffs: Stuff[]) => void;
};

export const StuffUpload = ({ stuffList, setStuffList, className }: StuffUploadProps) => {
    const { t } = useTranslation();
    const [expanded, setExpanded] = useState<boolean>(false);
    const [activeButton, setActiveButton] = useState<string | undefined>(undefined);

    const handleAccept = (newItem: Stuff) => {
        setStuffList([newItem, ...stuffList]);
        setActiveButton(undefined);
        setExpanded(false);
    };

    const handleClear = (itemToRemove: Stuff) => {
        const newItems = stuffList.filter(stuff => stuff._id !== itemToRemove._id);
        setStuffList(newItems);
    };

    return (
        <div className={className}>
            <div className={styles.toggleContainer} onClick={() => setExpanded(!expanded)}>
                <div className={cn(styles.togglePlus, {
                    [styles.toggleExpanded]: expanded
                })}>+</div>
                <div>{t('stuff-upload.description')}</div>
            </div>
            <div className={cn({
                [styles.childrenExpanded]: expanded,
                [styles.childrenCollapsed]: !expanded
            })}>
                <div className={styles.buttonsContainer}>
                    {Object.values(StuffTypes).map(value => (
                        <StuffUploadButton
                            key={value}
                            text={`stuff-upload.${value}.name`}
                            isActive={activeButton === value}
                            onClick={() => setActiveButton(value)}
                        />
                    ))}
                </div>
                {activeButton &&
                    <StuffUploadInput
                        i18nPrefix='stuff-upload'
                        type={getEnumValueByString(activeButton, StuffTypes)}
                        onAccept={handleAccept}
                    />
                }
            </div>
            {stuffList.length > 0 &&
                <div>{stuffList.map(stuff =>
                    <StuffItem
                        key={stuff._id}
                        stuff={stuff}
                        onClear={handleClear}
                    />
                )}</div>
            }
        </div>
    );
};