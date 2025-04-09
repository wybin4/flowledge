import { useRouter } from "next/navigation";
import { TablePageMode } from "@/types/TablePageMode";
import { useCallback } from "react";
import { ApiClient, FakeApiClient } from "@/types/ApiClient";
import { useQueryClient } from "@tanstack/react-query";
import { useSaveItem } from "@/hooks/useSaveItem";
import { TablePageActionType } from "@/types/TablePageActionType";
import { TablePageActionCallback } from "@/components/TablePage/EnhancedTablePage/types/TablePageActionCallback";

export const useSaveEnhancedTablePageItem = <T, U>(
    mode: TablePageMode,
    prefix: string,
    apiClient: ApiClient<T> | FakeApiClient<T>,
    transformItem: (item: T) => U,
    _id?: string,
    callback?: TablePageActionCallback<T>,
    isBackWithRouter = true
) => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const saveItem = useCallback(async (item: T | undefined) => {
        const isCreate = mode === TablePageMode.CREATE;
        const result = await useSaveItem({ isCreate, prefix, apiClient, transformItem, _id, item });
        if (result) {
            queryClient.invalidateQueries({ queryKey: [`${prefix}DataPage`] });
            isCreate && queryClient.invalidateQueries({ queryKey: [`${prefix}TotalCount`] });
            callback?.(mode === TablePageMode.CREATE ? TablePageActionType.CREATE : TablePageActionType.EDIT, result);
            if (isBackWithRouter) {
                router.back();
            }
        }
    }, [mode, prefix, _id, isBackWithRouter, callback]);

    return saveItem;
};