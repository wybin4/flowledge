import { useRouter } from "next/navigation";
import { TablePageMode } from "@/types/TablePageMode";
import { useCallback } from "react";
import { ApiClient, FakeApiClient } from "@/types/ApiClient";
import { IconKey } from "@/hooks/useIcon";

export const useSaveEnhancedTablePageItem = <T, U>(
    mode: TablePageMode,
    prefix: IconKey,
    apiClient: ApiClient<T> | FakeApiClient<T>,
    transformItem: (item: T) => U,
    _id?: string
) => {
    const router = useRouter();

    const saveApiIntegration = useCallback(async (item: T | undefined) => {
        const method = mode === TablePageMode.CREATE ? 'POST' : 'PUT';
        const url = mode === TablePageMode.CREATE ? `${prefix}` : `${prefix}/${_id}`;
        if (item) {
            const body = transformItem(item);
            await apiClient<T>({ url, options: { method, body: JSON.stringify(body) } });
            router.push(`/${prefix}`);
        }
    }, [mode]);

    return saveApiIntegration;
};