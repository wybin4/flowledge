import { ApiClientRequest } from "./types/ApiClient";

export const userApiClient = async <T>({ url, options }: ApiClientRequest): Promise<T> => {
    const response = await fetch(`http://localhost:8080/api/${url}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`Ошибка ${response.status}: ${await response.text()}`);
    }

    return response.json();
};

export const neuralApiClient = async <T>({ url, options }: ApiClientRequest): Promise<T> => {
    const response = await fetch(`http://localhost:8000/${url}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`Ошибка ${response.status}: ${await response.text()}`);
    }

    return await response.json();
};