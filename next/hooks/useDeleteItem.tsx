import { ApiClientMethods } from "@/apiClient";

export const useDeleteItem = <T,>(prefix: string, apiClient: ApiClientMethods, _id: string) =>
    apiClient.delete<T>(`${prefix}.delete/${_id}`);
