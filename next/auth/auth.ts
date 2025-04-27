import { redirect } from 'next/navigation';
import { userApiClient } from '../apiClient';
import { clearTokensClient, getTokensClient, saveTokensClient } from './tokens';

export const login = async (username: string, password: string) => {
    const response = await userApiClient.post<{ jwtToken: string; refreshToken: string }>('/auth/login', {
        username,
        password,
    });

    if (response) {
        saveTokensClient(response.jwtToken, response.refreshToken);
        return true;
    } else {
        throw new Error('Login failed');
    }
};

export const executeRefreshTokens = async (refreshToken: string, onError: () => void) => {
    try {
        const response = await fetch(`/api/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                refreshToken,
            }),
        });

        if (!response.ok) {
            throw new Error(`Ошибка ${response.status}: ${await response.text()}`);
        }

        const { jwtToken } = await response.json();
        saveTokensClient(jwtToken, refreshToken);
    } catch (error) {
        console.error('Ошибка при обновлении токенов:', error);
        onError?.();
    }
};


export const refreshTokens = async (onError: () => void) => {
    const tokens = await getTokensClient();
    if (!tokens?.refreshToken) {
        onError();
        throw new Error('No refresh token');
    }
    await executeRefreshTokens(tokens.refreshToken, onError);
};

export const onLoginError = <T>(): Promise<T> => {
    logout();
    redirect('/login');
};

export const logout = async () => {
    clearTokensClient();
};
