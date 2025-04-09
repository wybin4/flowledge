import { Button } from "@/components/Button/Button";

import { ButtonType } from "@/components/Button/Button";
import { TablePageMode } from "@/types/TablePageMode";
import { Dispatch, memo, SetStateAction, useCallback, useMemo } from "react";
import styles from "./EnhancedItem.module.css";
import { EnhancedItemAdditionalButton, EnhancedItemSettingKey } from "./EnhancedItem";
import { SettingWrapper } from "@/components/Settings/SettingWrapper/SettingWrapper";
import { UpdatableSetting } from "@/hooks/useSettings";
import { SettingValue } from "@/types/Setting";
import { Identifiable } from "@/types/Identifiable";

type EnhancedItemBodyProps<T> = {
    title: string;
    mode: TablePageMode;
    prefix: string;
    additionalButtons?: EnhancedItemAdditionalButton[];
    isEditMode: boolean;
    settingKeys: EnhancedItemSettingKey[];
    hasChanges: boolean;
    item: T;
    setItem: Dispatch<SetStateAction<T | undefined>>;
    deleteItem: (_id: string) => Promise<void>;
    saveItem: (item: T | undefined) => Promise<void>;
};

const EnhancedItemBody = <T extends Identifiable,>({
    item, setItem,
    title, mode, prefix,
    settingKeys, additionalButtons,
    isEditMode, hasChanges,
    deleteItem, saveItem
}: EnhancedItemBodyProps<T>) => {
    const getSettingType = useCallback((key: string) => {
        return settingKeys.find((setting) => setting.name === key)?.type;
    }, [JSON.stringify(settingKeys)]);

    const renderSetting = useCallback((key: string) => {
        const value = item?.[key as keyof T];

        return {
            setting: {
                _id: key, i18nLabel: `${prefix}.${key}`,
                value,
                packageValue: value,
                type: getSettingType(key)
            } as SettingValue
        };
    }, [JSON.stringify(item)]);

    const handleSave = (setting: UpdatableSetting) => {
        setItem(prev => (prev ? { ...prev, [setting.id]: setting.value } : prev));
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
        <>
            <h2 className={styles.title}>{title}</h2>
            <div className={styles.settingsContainer}>{renderSettings()}</div>
            <div className={styles.buttonContainer}>
                {additionalButtons?.filter((button) => button.mode ? button.mode === mode : true).map((button) => (
                    <Button key={button.title} onClick={button.onClick} prefix={prefix} type={button.type} title={button.title} />
                ))}
                {isEditMode &&
                    <Button onClick={() => deleteItem(item._id)} prefix={prefix} type={ButtonType.DELETE} />
                }
                {hasChanges && item &&
                    <Button onClick={() => saveItem(item)} prefix={prefix} type={ButtonType.SAVE} />
                }
            </div>
        </>
    );
};

const EnhancedItemBodyComponent = memo(
    EnhancedItemBody,
    (prevProps, nextProps) => JSON.stringify(prevProps.item) === JSON.stringify(nextProps.item)
) as typeof EnhancedItemBody;

export default EnhancedItemBodyComponent;

