"use client";

import { SettingType } from "@/types/Setting";
import { useTranslation } from "react-i18next";
import { memo, ReactNode, useCallback, useEffect, useState } from "react";
import { TablePageMode } from "@/types/TablePageMode";
import { TransformItemToSave, useSaveEnhancedTablePageItem } from "@/components/TablePage/EnhancedTablePage/hooks/useSaveEnhancedTablePageItem";
import { useDeleteEnhancedTablePageItem } from "@/components/TablePage/EnhancedTablePage/hooks/useDeleteEnhancedTablePageItem";
import { useGetEnhancedTablePageItem } from "@/components/TablePage/EnhancedTablePage/hooks/useGetEnhancedTablePageItem";
import { ButtonType } from "@/components/Button/Button";
import { ButtonBackProps } from "@/components/Button/ButtonBack/ButtonBack";
import { ButtonBackContainer, ButtonBackContainerProps } from "@/components/Button/ButtonBack/ButtonBackContainer";
import { QueryParams } from "@/types/QueryParams";
import EnhancedItemBody from "./EnhancedItemBody";
import { Identifiable } from "@/types/Identifiable";
import { TablePageActionType } from "@/types/TablePageActionType";
import { areEnhancedItemPropsEqual } from "./areEnhancedItemPropsEqual";
import { ApiClientMethods } from "@/apiClient";
import { MultiSettingWrapperAdditionalProps } from "@/components/Settings/SettingWrapper/MultiSettingWrapper";
import { ChildrenPosition } from "@/types/ChildrenPosition";
import { CUDPermissions } from "../../CRUDTablePage/CUDPermissions";

export type EnhancedItemAdditionalButton = {
    title: string;
    onClick: () => void;
    mode?: TablePageMode;
    type: ButtonType;
};

export type EnhancedItemSettingKey = {
    name: string;
    i18nLabel?: string;
    types: SettingType[];
    additionalProps?: MultiSettingWrapperAdditionalProps;
    hasDescription?: boolean;
    error?: string;
};

export interface BaseEnhancedItemProps {
    prefix: string;
    mode: TablePageMode;
    additionalButtons?: (EnhancedItemAdditionalButton | ReactNode)[];
    additionalChildren?: ReactNode;
    settingKeys: EnhancedItemSettingKey[];
    hasTitle?: boolean;
    settingsContainerClassNames?: string;
    buttonContainerClassNames?: string;
    permissions: Omit<CUDPermissions, 'isCreationPermitted'>;
}

export interface EnhancedItemProps<T, U> extends BaseEnhancedItemProps {
    _id?: string;
    apiPrefix?: string;
    apiClient: ApiClientMethods;
    transformItemToSave: TransformItemToSave<T, U>;
    createEmptyItem: () => T;
    useGetItemHook?: (callback: (item: T) => void) => (_id: string) => void;

    backButton?: ButtonBackProps & Pick<ButtonBackContainerProps, 'type' | 'compressBody'>;
    containerStyles?: string;
    queryParams?: QueryParams;
    isBackWithRouter?: boolean;
    onActionCallback?: (type: TablePageActionType, item?: T) => void;
    hasDeleteDescription?: boolean;

    title?: string;
}

const EnhancedItem = <T extends Identifiable, U>({
    _id, mode, prefix, apiPrefix, permissions,
    apiClient, queryParams,
    settingKeys,
    transformItemToSave, createEmptyItem,
    useGetItemHook,
    additionalButtons, additionalChildren,
    backButton,
    containerStyles,
    isBackWithRouter = true,
    hasDeleteDescription = true,
    hasTitle = true, title,
    settingsContainerClassNames, buttonContainerClassNames,
    onActionCallback
}: EnhancedItemProps<T, U>) => {
    const { t } = useTranslation();
    const [item, setItem] = useState<T | undefined>(undefined);
    const [initialValues, setInitialValues] = useState<T | undefined>(undefined);

    const realPrefix = apiPrefix ?? prefix;

    const isEditMode = mode === TablePageMode.EDIT && !!_id;

    const saveItem = useSaveEnhancedTablePageItem(
        mode, realPrefix, apiClient, transformItemToSave, _id, onActionCallback, isBackWithRouter
    );
    const deleteItem = useDeleteEnhancedTablePageItem(
        realPrefix, apiClient, onActionCallback, isBackWithRouter
    );

    const setItemAndInitialValues = (newItem: T) => {
        setItem(newItem);
        setInitialValues(newItem);
    };

    const getItem = useGetItemHook ?
        useGetItemHook(setItemAndInitialValues) :
        useGetEnhancedTablePageItem(
            realPrefix, apiClient, setItemAndInitialValues, queryParams
        );


    useEffect(() => {
        if (isEditMode) {
            getItem(_id);
        } else {
            const newItem = createEmptyItem();
            setItemAndInitialValues(newItem as T);
        }
    }, [_id, mode]);

    const hasChanges = useCallback(() => {
        if (!initialValues || !item) return false;
        return JSON.stringify(initialValues) !== JSON.stringify(item);
    }, [JSON.stringify(initialValues), JSON.stringify(item)]);

    if (!item) {
        return <div>{t('loading')}</div>;
    }
   
    return (
        <ButtonBackContainer className={containerStyles} {...backButton}>{button =>
            <EnhancedItemBody<T>
                item={item}
                setItem={setItem}
                permissions={permissions}
                deleteItem={deleteItem}
                saveItem={saveItem}
                title={title ? title : isEditMode ? t(`${prefix}.edit`) : t(`${prefix}.create`)}
                mode={mode}
                prefix={prefix}
                settingKeys={settingKeys}
                additionalChildren={additionalChildren}
                additionalButtons={
                    backButton?.type === ChildrenPosition.Bottom
                        ? additionalButtons ? [...additionalButtons, button] : [button]
                        : additionalButtons
                }
                isEditMode={isEditMode}
                hasChanges={hasChanges()}
                deleteItemDescription={hasDeleteDescription ? t(`${prefix}.delete-description`) : undefined}
                hasTitle={hasTitle}
                settingsContainerClassNames={settingsContainerClassNames}
                buttonContainerClassNames={buttonContainerClassNames}
            />
        }</ButtonBackContainer>
    );
};

const EnhancedItemComponent = memo(EnhancedItem, areEnhancedItemPropsEqual) as typeof EnhancedItem;

export default EnhancedItemComponent;