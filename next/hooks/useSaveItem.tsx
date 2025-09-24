import { ApiClientMethods } from "@/apiClient";

export const useSaveItem = async<T, U>({
    isCreate,
    prefix,
    apiClient,
    transformItem,
    id,
    item
}: {
    isCreate: boolean,
    prefix: string,
    apiClient: ApiClientMethods,
    transformItem?: (item: T) => U,
    id?: string,
    item: T | undefined
}) => {
    const url = isCreate ? `${prefix}.create` : `${prefix}.update/${id}`;
    if (item) {
        const body = transformItem ? transformItem(item) : item;
        return await apiClient.post<T>(url, body);
    }
    return undefined;
}   
