import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { ApiClient } from "@/types/ApiClient";
import { useQueryClient } from "@tanstack/react-query";
import { useDeleteItem } from "@/hooks/useDeleteItem";
import { TablePageActionCallback } from "@/components/TablePage/EnhancedTablePage/types/TablePageActionCallback";
import { TablePageActionType } from "@/types/TablePageActionType";

export const useDeleteEnhancedTablePageItem = <T,>(
    prefix: string, apiClient: ApiClient<T>, callback?: TablePageActionCallback<T>, isBackWithRouter = true
) => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const deleteEnhancedTablePageItem = useCallback(async (_id: string) => {
        await useDeleteItem(prefix, apiClient, _id);
        queryClient.invalidateQueries({ queryKey: [`${prefix}DataPage`] });
        queryClient.invalidateQueries({ queryKey: [`${prefix}TotalCount`] });
        callback?.(TablePageActionType.DELETE, { _id } as T);
        if (isBackWithRouter) {
            router.back();
        }
    }, [router, queryClient, isBackWithRouter, callback]);

    return deleteEnhancedTablePageItem;
};