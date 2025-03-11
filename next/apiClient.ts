export const apiClient = async <T>(url: string, options?: RequestInit): Promise<T> => {
    const response = await fetch(`http://localhost:8080/api${url}`, {
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
