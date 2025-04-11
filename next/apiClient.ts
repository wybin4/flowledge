export const userApiClientPrefix = 'http://localhost:8080/api';

export type ApiClientRequest = { url: string, options?: RequestInit };

export type ApiClientMethods = {
    get: <T>(url: string, options?: Omit<ApiClientRequest['options'], 'method'>) => Promise<T>;
    post: <T>(url: string, body: any, options?: Omit<ApiClientRequest['options'], 'method' | 'body'>) => Promise<T>;
    put: <T>(url: string, body: any, options?: Omit<ApiClientRequest['options'], 'method' | 'body'>) => Promise<T>;
    delete: <T>(url: string, options?: Omit<ApiClientRequest['options'], 'method'>) => Promise<T>;
};

const createApiClient = (baseUrl: string): ApiClientMethods => {
    const client = async <T>({ url, options }: ApiClientRequest): Promise<T> => {
        const response = await fetch(`${baseUrl}/${url}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`Ошибка ${response.status}: ${await response.text()}`);
        }

        if (response.status === 204) {
            return {} as T;
        }

        return response.json();
    };

    return {
        get: <T>(url: string, options?: Omit<ApiClientRequest['options'], 'method'>) =>
            client<T>({ url, options: { ...options, method: 'GET' } }),

        post: <T>(url: string, body: any, options?: Omit<ApiClientRequest['options'], 'method' | 'body'>) =>
            client<T>({ url, options: { ...options, method: 'POST', body: JSON.stringify(body) } }),

        put: <T>(url: string, body: any, options?: Omit<ApiClientRequest['options'], 'method' | 'body'>) =>
            client<T>({ url, options: { ...options, method: 'PUT', body: JSON.stringify(body) } }),

        delete: <T>(url: string, options?: Omit<ApiClientRequest['options'], 'method'>) =>
            client<T>({ url, options: { ...options, method: 'DELETE' } }),
    };
};

export const userApiClient = createApiClient(userApiClientPrefix);
export const neuralApiClient = createApiClient('http://localhost:8000');
export const integrationApiClient = createApiClient('http://localhost:8001');