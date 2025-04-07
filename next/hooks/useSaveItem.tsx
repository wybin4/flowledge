import { ApiClient, FakeApiClient } from "@/types/ApiClient";

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
    apiClient: ApiClient<T> | FakeApiClient<T>,
    transformItem?: (item: T) => U,
    _id?: string,
    item: T | undefined
}) => {
    const method = isCreate ? 'POST' : 'PUT';
    const url = isCreate ? `${prefix}.create` : `${prefix}.update/${_id}`;
    if (item) {
        const body = transformItem ? transformItem(item) : item;
        return await apiClient<T>({ url, options: { method, body: JSON.stringify(body) } });
    }
    return undefined;
}   
