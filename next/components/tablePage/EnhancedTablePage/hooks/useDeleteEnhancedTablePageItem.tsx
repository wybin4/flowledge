import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { ApiClient } from "@/types/ApiClient";
import { useQueryClient } from "@tanstack/react-query";
import { useDeleteItem } from "@/hooks/useDeleteItem";

export const useDeleteEnhancedTablePageItem = <T,>(prefix: string, apiClient: ApiClient<T>) => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const deleteEnhancedTablePageItem = useCallback(async (_id: string) => {
        await useDeleteItem(prefix, apiClient, _id);
        queryClient.invalidateQueries({ queryKey: [`${prefix}DataPage`] });
        queryClient.invalidateQueries({ queryKey: [`${prefix}TotalCount`] });
        router.back();
    }, [router, queryClient]);

    return deleteEnhancedTablePageItem;
};