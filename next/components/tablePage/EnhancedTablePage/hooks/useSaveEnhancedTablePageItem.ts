import { useRouter } from "next/navigation";
import { TablePageMode } from "@/types/TablePageMode";
import { useCallback } from "react";
import { ApiClient, FakeApiClient } from "@/types/ApiClient";
import { useQueryClient } from "@tanstack/react-query";

export const useSaveEnhancedTablePageItem = <T, U>(
    mode: TablePageMode,
    prefix: string,
    apiClient: ApiClient<T> | FakeApiClient<T>,
    transformItem: (item: T) => U,
    _id?: string
) => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const saveItem = useCallback(async (item: T | undefined) => {
        const method = mode === TablePageMode.CREATE ? 'POST' : 'PUT';
        const url = mode === TablePageMode.CREATE ? `${prefix}.create` : `${prefix}.update/${_id}`;
        if (item) {
            const body = transformItem(item);
            await apiClient<T>({ url, options: { method, body: JSON.stringify(body) } });
            queryClient.invalidateQueries({ queryKey: [`${prefix}DataPage`] });
            mode === TablePageMode.CREATE && queryClient.invalidateQueries({ queryKey: [`${prefix}TotalCount`] });
            router.back();
        }
    }, [mode, prefix]);

    return saveItem;
};