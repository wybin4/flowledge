import { userApiClient } from './apiClient';
import { saveTokens, getTokens, clearTokens } from './collections/CachedCollection';

export const login = async (username: string, password: string) => {
    const response = await userApiClient.post<{ jwtToken: string; refreshToken: string }>('/auth/login', {
        username,
        password,
    });

    if (response) {
        saveTokens(response.jwtToken, response.refreshToken);
        return true;
    } else {
        throw new Error('Login failed');
    }
};

export const refreshTokens = async () => {
    const tokens = getTokens();
    if (!tokens?.refreshToken) {
        throw new Error('No refresh token');
    }

    const response = await userApiClient.post<{ jwtToken: string; refreshToken: string }>('/auth/refresh', {
        refreshToken: tokens.refreshToken,
    });

    if (response) {
        saveTokens(response.jwtToken, response.refreshToken);
        return true;
    } else {
        clearTokens();
        throw new Error('Token refresh failed');
    }
};

export const logout = () => {
    clearTokens();
};