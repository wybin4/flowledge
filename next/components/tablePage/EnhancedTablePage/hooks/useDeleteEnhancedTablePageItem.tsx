import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDeleteItem } from "@/hooks/useDeleteItem";
import { TablePageActionCallback } from "@/components/TablePage/EnhancedTablePage/types/TablePageActionCallback";
import { TablePageActionType } from "@/types/TablePageActionType";
import { ApiClientMethods } from "@/apiClient";

export const useDeleteEnhancedTablePageItem = <T,>(
    prefix: string, apiClient: ApiClientMethods, callback?: TablePageActionCallback<T>, isBackWithRouter = true
) => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const deleteEnhancedTablePageItem = useCallback(async (id: string) => {
        await useDeleteItem(prefix, apiClient, id);
        queryClient.invalidateQueries({ queryKey: [`${prefix}DataPage`] });
        queryClient.invalidateQueries({ queryKey: [`${prefix}TotalCount`] });
        callback?.(TablePageActionType.DELETE, { id } as T);
        if (isBackWithRouter) {
            router.back();
        }
    }, [router, queryClient, isBackWithRouter, callback]);

    return deleteEnhancedTablePageItem;
};