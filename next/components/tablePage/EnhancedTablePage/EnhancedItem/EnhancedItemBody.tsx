import { Button } from "@/components/Button/Button";

import { ButtonType } from "@/components/Button/Button";
import { Dispatch, memo, ReactNode, SetStateAction, useCallback } from "react";
import styles from "./EnhancedItem.module.css";
import { BaseEnhancedItemProps, EnhancedItemAdditionalButton } from "./EnhancedItem";
import { SettingWrapper } from "@/components/Settings/SettingWrapper/SettingWrapper";
import { UpdatableSetting } from "@/hooks/useSettings";
import { SettingValue } from "@/types/Setting";
import { Identifiable } from "@/types/Identifiable";
import { areEnhancedItemBodyPropsEqual } from "./areEnhancedItemPropsEqual";
import { MultiSettingWrapper, MultiSettingWrapperSetting } from "@/components/Settings/SettingWrapper/MultiSettingWrapper";
import React from "react";
import cn from "classnames";

export interface EnhancedItemBodyProps<T> extends BaseEnhancedItemProps<T> {
    title: string;

    isEditMode: boolean;
    hasChanges: boolean;
    item: T;
    setItem: Dispatch<SetStateAction<T | undefined>>;
    deleteItem: (_id: string) => Promise<void>;
    saveItem: (item: T | undefined) => Promise<void>;
    deleteItemDescription?: string;
};

const EnhancedItemBody = <T extends Identifiable,>({
    item, setItem, permissions,
    title, mode, prefix,
    settingKeys, additionalButtons, additionalChildren,
    isEditMode, hasChanges, hasTitle = true,
    deleteItem, deleteItemDescription,
    settingsContainerClassNames, buttonContainerClassNames,
    saveItem
}: EnhancedItemBodyProps<T>) => {
    const { isEditionPermitted, isDeletionPermitted } = permissions;
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
                i18nLabel: props.i18nLabel ? props.i18nLabel : hasDescription ? `${prefix}.${key}.name` : `${prefix}.${key}`,
                i18nDescription: hasDescription ? `${prefix}.${key}.description` : undefined,
                value,
                packageValue: value,
                type: !isMulti ? types?.[0] : undefined,
                options: additionalProps?.options,
                prefix: additionalProps?.prefix,
                selectedKey: additionalProps?.selectedKey,
                withWrapper: additionalProps?.withWrapper
            },
            types,
            additionalProps,
            isMulti
        };
    }, [JSON.stringify(item), JSON.stringify(settingKeys)]);

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
                    return (
                        <SettingWrapper
                            key={index}
                            validateError={settingKeys[index].error}
                            debounceTime={0}
                            withWrapper={setting.withWrapper}
                            setting={setting as SettingValue}
                            handleSave={(newValue) => {
                                handleSave({ id: setting._id, value: newValue.value });
                            }}
                        />
                    );
                }
            }
            return null;
        });
    };
 
    return (
        <>
            {hasTitle && <h2 className={styles.title}>{title}</h2>}
            {additionalChildren?.(item)}
            <div className={cn(styles.settingsContainer, settingsContainerClassNames)}>{renderSettings()}</div>
            <div className={cn(styles.buttonContainer, buttonContainerClassNames)}>
                {
                    additionalButtons && !!additionalButtons.length &&
                    additionalButtons
                        .map((button: EnhancedItemAdditionalButton | ReactNode) => {
                            if (typeof button === 'object' && button !== null && !React.isValidElement(button)) {
                                const enhancedButton = button as EnhancedItemAdditionalButton;
                                if (enhancedButton.mode === mode) {
                                    return <Button key={enhancedButton.title} onClick={enhancedButton.onClick} prefix={prefix} type={enhancedButton.type} title={enhancedButton.title} />
                                }

                                return null;
                            } else if (React.isValidElement(button)) {
                                return button;
                            }
                            return null;
                        })
                }
                {isDeletionPermitted && isEditMode &&
                    <div className={styles.deleteContainer}>
                        <Button onClick={() => deleteItem(item._id)} prefix={prefix} type={ButtonType.DELETE} />
                        {deleteItemDescription &&
                            <div className={styles.description}>{deleteItemDescription}</div>
                        }
                    </div>
                }
                {isEditionPermitted && hasChanges && item &&
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

