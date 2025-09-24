import { ApiClientMethods } from "@/apiClient";

export const useDeleteItem = <T,>(prefix: string, apiClient: ApiClientMethods, id: string) =>
    apiClient.delete<T>(`${prefix}.delete/${id}`);
