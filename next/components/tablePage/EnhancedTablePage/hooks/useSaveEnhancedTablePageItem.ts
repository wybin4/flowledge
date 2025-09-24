import { useRouter } from "next/navigation";
import { TablePageMode } from "@/types/TablePageMode";
import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSaveItem } from "@/hooks/useSaveItem";
import { TablePageActionType } from "@/types/TablePageActionType";
import { TablePageActionCallback } from "@/components/TablePage/EnhancedTablePage/types/TablePageActionCallback";
import { ApiClientMethods } from "@/apiClient";

export type TransformItemToSave<T, U> = (item: T) => U;

export const useSaveEnhancedTablePageItem = <T, U>(
    mode: TablePageMode,
    prefix: string,
    apiClient: ApiClientMethods,
    transformItem: (item: T) => U,
    id?: string,
    callback?: TablePageActionCallback<T>,
    isBackWithRouter = true
) => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const saveItem = useCallback(async (item: T | undefined) => {
        const isCreate = mode === TablePageMode.CREATE;
        const result = await useSaveItem({ isCreate, prefix, apiClient, transformItem, id, item });
        if (result) {
            queryClient.invalidateQueries({ queryKey: [`${prefix}DataPage`] });
            isCreate && queryClient.invalidateQueries({ queryKey: [`${prefix}TotalCount`] });
            callback?.(mode === TablePageMode.CREATE ? TablePageActionType.CREATE : TablePageActionType.EDIT, result);
            if (isBackWithRouter) {
                router.back();
            }
        }
    }, [mode, prefix, id, isBackWithRouter, callback]);

    return saveItem;
};