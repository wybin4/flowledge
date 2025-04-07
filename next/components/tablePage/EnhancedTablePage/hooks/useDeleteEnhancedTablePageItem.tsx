import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { ApiClient } from "@/types/ApiClient";

import { useQueryClient } from "@tanstack/react-query";

export const useDeleteEnhancedTablePageItem = <T,>(prefix: string, apiClient: ApiClient<T>) => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const deleteEnhancedTablePageItem = useCallback(async (_id: string) => {
        await apiClient({ url: `${prefix}.delete/${_id}`, options: { method: 'DELETE' } });
        queryClient.invalidateQueries({ queryKey: [`${prefix}DataPage`] });
        queryClient.invalidateQueries({ queryKey: [`${prefix}TotalCount`] });
        router.back();
    }, [router, queryClient]);

    return deleteEnhancedTablePageItem;
};