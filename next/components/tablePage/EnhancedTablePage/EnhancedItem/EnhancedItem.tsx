"use client";

import { SettingType, SettingValue } from "@/types/Setting";
import styles from "./EnhancedItem.module.css";
import { useTranslation } from "react-i18next";
import { SettingWrapper } from "@/components/Settings/SettingWrapper/SettingWrapper";
import { useEffect, useState } from "react";
import { TablePageMode } from "@/types/TablePageMode";
import { UpdatableSetting } from "@/hooks/useSettings";
import { useSaveEnhancedTablePageItem } from "@/components/TablePage/EnhancedTablePage/hooks/useSaveEnhancedTablePageItem";
import { useDeleteEnhancedTablePageItem } from "@/components/TablePage/EnhancedTablePage/hooks/useDeleteEnhancedTablePageItem";
import { useGetEnhancedTablePageItem } from "@/components/TablePage/EnhancedTablePage/hooks/useGetEnhancedTablePageItem";
import { IconKey } from "@/hooks/useIcon";
import { ApiClient, FakeApiClient } from "@/types/ApiClient";
import { Button, ButtonType } from "@/components/Button/Button";
import { ButtonBackProps } from "@/components/Button/ButtonBack/ButtonBack";
import { ButtonBackContainer } from "@/components/Button/ButtonBack/ButtonBackContainer";

interface EnhancedItemProps<T, U> {
    _id?: string;
    mode: TablePageMode;
    prefix: IconKey;
    apiClient: ApiClient<T> | FakeApiClient<T>;
    settingKeys: { name: string, type: SettingType }[];
    transformItemToSave: (item: T) => U;
    createEmptyItem: () => T;
    additionalButtons?: { title: string, onClick: () => void, mode?: TablePageMode, type: ButtonType }[];
    backButton?: ButtonBackProps;
    containerStyles?: string;
}

export const EnhancedItem = <T, U>({
    _id, mode, prefix,
    apiClient,
    settingKeys,
    transformItemToSave, createEmptyItem,
    additionalButtons,
    backButton,
    containerStyles
}: EnhancedItemProps<T, U>) => {
    const { t } = useTranslation();
    const [item, setItem] = useState<T | undefined>(undefined);
    const [initialValues, setInitialValues] = useState<T | undefined>(undefined);

    const isEditMode = mode === TablePageMode.EDIT && _id;

    const saveItem = useSaveEnhancedTablePageItem(mode, prefix, apiClient, transformItemToSave, _id);
    const deleteItem = useDeleteEnhancedTablePageItem(prefix, apiClient);
    const getItem = useGetEnhancedTablePageItem(prefix, apiClient, (item) => {
        setItem(item);
        setInitialValues(item);
    });

    useEffect(() => {
        if (isEditMode) {
            getItem(_id);
        } else {
            const newItem = createEmptyItem();
            setItem(newItem as T);
            setInitialValues(newItem as T);
        }
    }, [_id, mode]);

    const hasChanges = () => {
        if (!initialValues || !item) return false;
        return JSON.stringify(initialValues) !== JSON.stringify(item);
    };

    if (!item) {
        return <div>{t('loading')}</div>;
    }

    const getSettingType = (key: string) => {
        return settingKeys.find((setting) => setting.name === key)?.type;
    };

    const renderSetting = (key: string) => {
        const value = item[key as keyof T];
        return {
            setting: {
                _id: key, i18nLabel: `${prefix}.${key}`,
                value,
                packageValue: value,
                type: getSettingType(key)
            } as SettingValue
        };
    };

    const handleSave = (setting: UpdatableSetting) => {
        setItem((prev) => {
            if (!prev) return prev;
            return { ...prev, [setting.id]: setting.value };
        });
    };

    const renderSettings = () => {
        const settings = settingKeys.map((key) => renderSetting(key.name));

        return settings.map(({ setting }, index) => (
            <SettingWrapper key={index} setting={setting} handleSave={(newValue) => {
                handleSave({ id: setting._id, value: newValue.value });
            }} />
        ));
    };

    return (
        <ButtonBackContainer className={containerStyles} {...backButton}>
            <h2 className={styles.title}>{mode === TablePageMode.CREATE ? t(`${prefix}.create`) : t(`${prefix}.edit`)}</h2>
            <div className={styles.settingsContainer}>
                {renderSettings()}
            </div>
            <div className={styles.buttonContainer}>
                {additionalButtons?.filter((button) => button.mode ? button.mode === mode : true).map((button) => (
                    <Button key={button.title} onClick={button.onClick} prefix={prefix} type={button.type} title={button.title} />
                ))}
                {isEditMode &&
                    <Button onClick={() => deleteItem(_id)} prefix={prefix} type={ButtonType.DELETE} />
                }
                {hasChanges() && item &&
                    <Button onClick={() => saveItem(item)} prefix={prefix} type={ButtonType.SAVE} />
                }
            </div>
        </ButtonBackContainer>
    );
};