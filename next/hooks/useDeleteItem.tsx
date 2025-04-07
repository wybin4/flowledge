import { ApiClient } from "@/types/ApiClient";

export const useDeleteItem = <T,>(prefix: string, apiClient: ApiClient<T>, _id: string) => apiClient<T>(
    { url: `${prefix}.delete/${_id}`, options: { method: 'DELETE' } }
);
