"use client";

import { EnhancedTablePage, EnhancedTablePageProps } from "@/components/TablePage/EnhancedTablePage/EnhancedTablePage";
import { TFunction } from "i18next";
import RightSidebar from "@/components/Sidebar/RightSidebar/RightSidebar";
import cn from "classnames";
import styles from "./CRUDTablePage.module.css";
import { TablePageMode } from "@/types/TablePageMode";
import { useRouter, useSearchParams } from "next/navigation";
import { useNonPersistentSidebar } from "@/hooks/useNonPersistentSidebar";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { RightSidebarModal, RightSidebarModalProps } from "@/components/Sidebar/RightSidebar/RightSidebarModal";
import { TopBottomPosition } from "@/types/Sortable";
import { Identifiable } from "@/types/Identifiable";

export type CreateTableHeaderProps = {
    t: TFunction;
    onSort: (name: string, position?: TopBottomPosition) => void;
};

export type GetTableHeaderItemsProps = {
    t: TFunction;
    setSortQuery: (query: string) => void;
};

interface CRUDTablePageProps<T, L, U> extends EnhancedTablePageProps<T, U>, Omit<RightSidebarModalProps<T, L>, 'prefix' | 'mode'> {
    mode?: TablePageMode;
    selectedItemId: string | undefined;
    setSelectedItemId: Dispatch<SetStateAction<string | undefined>>;
};

export const CRUDTablePage = <T extends Identifiable, L, U extends Identifiable>({
    prefix, selectedItemId, setSelectedItemId, mode, ...props
}: CRUDTablePageProps<T, L, U>) => {
    const [expanded, setExpanded] = useState<boolean>(false);

    const router = useRouter();
    const searchParams = useSearchParams();

    const updateState = (mode: string | null, id?: string) => {
        const hasMode = !!mode;
        setExpanded(hasMode);
        setSelectedItemId(hasMode ? id : undefined);
    };

    const onItemClick = (_id?: string) => {
        const currentMode = searchParams.get('mode');
        if (currentMode) {
            router.push(`/${prefix}`);
            updateState(null);
        } else {
            router.push(`/${prefix}/?mode=${TablePageMode.EDIT}`);
            updateState(TablePageMode.EDIT, _id);
        }
    };

    useEffect(() => {
        if (!selectedItemId && mode === TablePageMode.EDIT) {
            router.push(`/${prefix}`);
        } else {
            const currentMode = searchParams.get('mode');
            updateState(currentMode, selectedItemId);
        }
    }, [searchParams.get('mode')]);

    const {
        apiPrefix, apiClient, queryParams, getDataPageFunctions,
        transformData, transformItemToSave,
        createEmptyItem, getHeaderItems,
        additionalButtons, hasDeleteDescription,
        settingKeys, itemKeys
    } = props;

    return (
        <RightSidebar
            useSidebarHook={useNonPersistentSidebar}
            expanded={expanded}
            content={classNames => <div className={cn(classNames)}>{mode &&
                <RightSidebarModal<T, L>
                    prefix={prefix}
                    apiClient={apiClient}
                    apiPrefix={apiPrefix}
                    queryParams={queryParams}
                    mode={mode}
                    _id={selectedItemId}
                    settingKeys={settingKeys}
                    transformItemToSave={transformItemToSave}
                    createEmptyItem={createEmptyItem}
                    onBackButtonClick={() => updateState(null)}
                    additionalButtons={additionalButtons}
                    hasDeleteDescription={hasDeleteDescription}
                />
            }</div>}>
            {(isExpanded, toggleSidebar) => (
                <div>
                    <EnhancedTablePage<T, U>
                        prefix={prefix}
                        apiPrefix={apiPrefix}
                        getDataPageFunctions={getDataPageFunctions}
                        getHeaderItems={getHeaderItems}
                        transformData={transformData}
                        itemKeys={itemKeys}
                        onItemClick={(_id) => {
                            toggleSidebar();
                            onItemClick(_id);
                        }}
                        className={cn({
                            [styles.elementsExpanded]: isExpanded
                        })}
                        tableStyles={cn({
                            [styles.bodyExpanded]: isExpanded
                        })}
                    />
                </div>
            )}
        </RightSidebar>
    );
};