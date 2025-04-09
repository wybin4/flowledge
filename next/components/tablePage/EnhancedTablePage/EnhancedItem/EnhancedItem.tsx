"use client";

import { SettingType } from "@/types/Setting";
import { useTranslation } from "react-i18next";
import { memo, useCallback, useEffect, useState } from "react";
import { TablePageMode } from "@/types/TablePageMode";
import { useSaveEnhancedTablePageItem } from "@/components/TablePage/EnhancedTablePage/hooks/useSaveEnhancedTablePageItem";
import { useDeleteEnhancedTablePageItem } from "@/components/TablePage/EnhancedTablePage/hooks/useDeleteEnhancedTablePageItem";
import { useGetEnhancedTablePageItem } from "@/components/TablePage/EnhancedTablePage/hooks/useGetEnhancedTablePageItem";
import { ApiClient, FakeApiClient } from "@/types/ApiClient";
import { ButtonType } from "@/components/Button/Button";
import { ButtonBackProps } from "@/components/Button/ButtonBack/ButtonBack";
import { ButtonBackContainer } from "@/components/Button/ButtonBack/ButtonBackContainer";
import { QueryParams } from "@/types/QueryParams";
import EnhancedItemBody from "./EnhancedItemBody";
import { Identifiable } from "@/types/Identifiable";
import { TablePageActionType } from "@/types/TablePageActionType";

export type EnhancedItemAdditionalButton = {
    title: string;
    onClick: () => void;
    mode?: TablePageMode;
    type: ButtonType;
};
export type EnhancedItemSettingKey = { name: string, type: SettingType, hasDescription?: boolean };

export interface EnhancedItemProps<T, U> {
    _id?: string;
    mode: TablePageMode;
    prefix: string;
    apiPrefix?: string;
    apiClient: ApiClient<T> | FakeApiClient<T>;
    settingKeys: EnhancedItemSettingKey[];
    transformItemToSave: (item: T) => U;
    createEmptyItem: () => T;
    useGetItemHook?: (callback: (item: T) => void) => (_id: string) => void;
    additionalButtons?: EnhancedItemAdditionalButton[];
    backButton?: ButtonBackProps;
    containerStyles?: string;
    queryParams?: QueryParams;
    isBackWithRouter?: boolean;
    onActionCallback?: (type: TablePageActionType, item?: T) => void;
}

const EnhancedItem = <T extends Identifiable, U>({
    _id, mode, prefix, apiPrefix,
    apiClient, queryParams,
    settingKeys,
    transformItemToSave, createEmptyItem,
    useGetItemHook,
    additionalButtons,
    backButton,
    containerStyles,
    isBackWithRouter = true,
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
        <ButtonBackContainer className={containerStyles} {...backButton}>
            <EnhancedItemBody<T>
                item={item}
                setItem={setItem}
                deleteItem={deleteItem}
                saveItem={saveItem}
                title={isEditMode ? t(`${prefix}.edit`) : t(`${prefix}.create`)}
                mode={mode}
                prefix={prefix}
                settingKeys={settingKeys}
                additionalButtons={additionalButtons}
                isEditMode={isEditMode}
                hasChanges={hasChanges()}
                deleteItemDescription={t(`${prefix}.delete-description`)}
            />
        </ButtonBackContainer>
    );
};

const EnhancedItemComponent = memo(EnhancedItem, (prevProps, nextProps) =>
    prevProps._id === nextProps._id && prevProps.mode === nextProps.mode
) as typeof EnhancedItem;

export default EnhancedItemComponent;