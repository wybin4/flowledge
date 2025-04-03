import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { IconKey } from "@/hooks/useIcon";
import { ApiClient } from "@/types/ApiClient";

import { useQueryClient } from "@tanstack/react-query";

export const useDeleteEnhancedTablePageItem = <T,>(prefix: IconKey, apiClient: ApiClient<T>) => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const deleteEnhancedTablePageItem = useCallback(async (_id: string) => {
        await apiClient({ url: `${prefix}/${_id}`, options: { method: 'DELETE' } });
        queryClient.invalidateQueries({ queryKey: [`${prefix}DataPage`] });
        queryClient.invalidateQueries({ queryKey: [`${prefix}TotalCount`] });
        router.back();
    }, [router, queryClient]);

    return deleteEnhancedTablePageItem;
};