import { getTokensClient } from './auth/tokens';
import { onLoginError, refreshTokens } from './auth/auth';
import { uploadsPrefix } from './helpers/prefixes';

export const userApiClientPrefix = 'http://localhost:8080';
export const uploadsApiPrefix = `${userApiClientPrefix}/api/${uploadsPrefix}`;

export type ApiClientRequest = { url: string, options?: RequestInit };

export type ApiClientMethods = {
    get: <T>(url: string, options?: Omit<ApiClientRequest['options'], 'method'>) => Promise<T>;
    post: <T>(url: string, body: any, options?: Omit<ApiClientRequest['options'], 'method' | 'body'>) => Promise<T>;
    put: <T>(url: string, body: any, options?: Omit<ApiClientRequest['options'], 'method' | 'body'>) => Promise<T>;
    delete: <T>(url: string, options?: Omit<ApiClientRequest['options'], 'method'>) => Promise<T>;
};

const createApiClient = (baseUrl: string): ApiClientMethods => {
    const makeRequest = async <T>(url: string, options: RequestInit): Promise<T> => {
        const response = await fetch(`${baseUrl}/api/${url}`, {
            ...options,
            credentials: 'include',
        });

        if (!response.ok) {
            if (response.status == 401) {
                return handleTokenRefresh<T>(url, options);
            }

            if (response.status == 403) {
                onLoginError();
            }

            throw new Error(`Ошибка ${response.status}: ${await response.text()}`);
        }

        if (response.status === 204) {
            return {} as T;
        }

        return response.json();
    };

    const handleTokenRefresh = async <T>(url: string, options: RequestInit): Promise<T> => {
        refreshTokens(onLoginError);
        const newTokens = await getTokensClient();
        if (newTokens?.jwtToken) {
            return makeRequest<T>(url, options);
        } else {
            return onLoginError();
        }
    };

    const client = async <T>({ url, options }: ApiClientRequest): Promise<T> => {
        const isGetMethod = options?.method?.toUpperCase() === 'GET';

        const finalHeaders = {
            ...(isGetMethod ? {} : { 'Content-Type': 'application/json' }),
            ...options?.headers,
        };

        const requestOptions = {
            ...options,
            headers: finalHeaders,
        };

        try {
            return await makeRequest<T>(url, requestOptions);
        } catch (error) {
            throw error;
        }
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