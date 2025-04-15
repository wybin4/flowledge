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
import { areEnhancedItemBodyPropsEqual } from "./areEnhancedItemPropsEqual";
import { MultiSettingWrapper, MultiSettingWrapperSetting } from "@/components/Settings/SettingWrapper/MultiSettingWrapper";

export type EnhancedItemBodyProps<T> = {
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
    deleteItemDescription?: string;
    saveItem: (item: T | undefined) => Promise<void>;
};

const EnhancedItemBody = <T extends Identifiable,>({
    item, setItem,
    title, mode, prefix,
    settingKeys, additionalButtons,
    isEditMode, hasChanges,
    deleteItem, deleteItemDescription,
    saveItem
}: EnhancedItemBodyProps<T>) => {
    const getSetting = useCallback((key: string) => {
        const value = item?.[key as keyof T];
        const props = settingKeys.find((setting) => setting.name === key);

        if (!props) {
            return { setting: undefined, isMulti: false };
        }

        const { hasDescription, additionalProps, types } = props;
        const isMulti = (types?.length || 0) > 1;

        return {
            setting: {
                _id: key,
                i18nLabel: hasDescription ? `${prefix}.${key}.name` : `${prefix}.${key}`,
                i18nDescription: hasDescription ? `${prefix}.${key}.description` : undefined,
                value,
                packageValue: value,
                type: !isMulti ? types?.[0] : undefined,
            },
            types,
            additionalProps,
            isMulti
        };
    }, [JSON.stringify(item)]);

    const handleSave = (setting: UpdatableSetting) => {
        setItem(prev => (prev ? { ...prev, [setting.id]: setting.value } : prev));
    };

    const renderSettings = () => {
        const settings = settingKeys.map((key) => getSetting(key.name));

        return settings.map(({ setting, isMulti, types, additionalProps }, index) => {
            if (setting) {
                if (isMulti) {
                    return (
                        <MultiSettingWrapper
                            key={index}
                            setting={setting as MultiSettingWrapperSetting}
                            additionalProps={additionalProps}
                            types={types}
                            handleSave={(newValue) => {
                                handleSave({ id: setting._id, value: newValue.value });
                            }}
                        />
                    );
                } else {
                    return (<SettingWrapper
                        key={index}
                        validateError={settingKeys[index].error}
                        debounceTime={0}
                        withWrapper={true}
                        setting={setting as SettingValue}
                        handleSave={(newValue) => {
                            handleSave({ id: setting._id, value: newValue.value });
                        }}
                    />);
                }
            }
            return null;
        });
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
                    <div className={styles.deleteContainer}>
                        <Button onClick={() => deleteItem(item._id)} prefix={prefix} type={ButtonType.DELETE} />
                        {deleteItemDescription &&
                            <div className={styles.description}>{deleteItemDescription}</div>
                        }
                    </div>
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
    (prevProps, nextProps) => areEnhancedItemBodyPropsEqual(prevProps, nextProps)
) as typeof EnhancedItemBody;

export default EnhancedItemBodyComponent;

