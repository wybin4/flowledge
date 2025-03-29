import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { IconKey } from "@/hooks/useIcon";
import { ApiClient } from "@/types/ApiClient";

export const useDeleteEnhancedTablePageItem = <T,>(prefix: IconKey, apiClient: ApiClient<T>) => {
    const router = useRouter();

    const deleteEnhancedTablePageItem = useCallback(async (_id: string) => {
        await apiClient({ url: `${prefix}/${_id}`, options: { method: 'DELETE' } });
        router.push(`/${prefix}`);
    }, [router]);

    return deleteEnhancedTablePageItem;
};