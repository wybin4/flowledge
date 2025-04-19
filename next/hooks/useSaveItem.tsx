import { ApiClientMethods } from "@/apiClient";

export const useSaveItem = async<T, U>({
    isCreate,
    prefix,
    apiClient,
    transformItem,
    _id,
    item
}: {
    isCreate: boolean,
    prefix: string,
    apiClient: ApiClientMethods,
    transformItem?: (item: T) => U,
    _id?: string,
    item: T | undefined
}) => {
    const method = isCreate ? 'POST' : 'PUT';
    const url = isCreate ? `${prefix}.create` : `${prefix}.update/${_id}`;
    if (item) {
        const body = transformItem ? transformItem(item) : item;
        return await apiClient.post<T>(url, body);
    }
    return undefined;
}   
