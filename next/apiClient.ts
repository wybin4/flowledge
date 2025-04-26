import { redirect } from 'next/navigation';
import { logout, refreshTokens } from './auth';
import { getTokens } from './collections/CachedCollection';

export const userApiClientPrefix = 'http://localhost:8080/api';

export type ApiClientRequest = { url: string, options?: RequestInit };

export type ApiClientMethods = {
    get: <T>(url: string, options?: Omit<ApiClientRequest['options'], 'method'>) => Promise<T>;
    post: <T>(url: string, body: any, options?: Omit<ApiClientRequest['options'], 'method' | 'body'>) => Promise<T>;
    put: <T>(url: string, body: any, options?: Omit<ApiClientRequest['options'], 'method' | 'body'>) => Promise<T>;
    delete: <T>(url: string, options?: Omit<ApiClientRequest['options'], 'method'>) => Promise<T>;
};

const createApiClient = (baseUrl: string, supportsTokens: boolean = false): ApiClientMethods => {
    const client = async <T>({ url, options }: ApiClientRequest): Promise<T> => {
        let headers = options?.headers;

        if (supportsTokens) {
            const tokens = getTokens();
            if (tokens?.jwtToken) {
                headers = {
                    ...headers,
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokens.jwtToken}`,
                };
            }
        }
        const response = await fetch(`${baseUrl}/${url}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });

        if (supportsTokens && response.status === 401) {
            // Попытка обновить токены
            await refreshTokens();
            const newTokens = getTokens();
            if (newTokens?.jwtToken) {
                const newResponse = await fetch(`${baseUrl}/${url}`, {
                    ...options,
                    headers: {
                        ...headers,
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${newTokens.jwtToken}`,
                    },
                });

                if (!newResponse.ok) {
                    throw new Error(`Ошибка ${newResponse.status}: ${await newResponse.text()}`);
                }

                if (newResponse.status === 204) {
                    return {} as T;
                }

                return newResponse.json();
            } else {
                throw new Error('Failed to refresh tokens');
            }
        }

        // Обработка 403
        if (response.status === 403) {
            logout(); // Очищаем токены
            redirect('/login');
        }

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

// userApiClient поддерживает токены
export const userApiClient = createApiClient(userApiClientPrefix, true);

// neuralApiClient и integrationApiClient не поддерживают токены
export const neuralApiClient = createApiClient('http://localhost:8000');
export const integrationApiClient = createApiClient('http://localhost:8001');