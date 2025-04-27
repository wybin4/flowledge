'use client';

import Cookies from 'js-cookie';
import { executeRefreshTokens, onLoginError, refreshTokens } from './auth';

const JWT_TOKEN_COOKIE = 'jwtToken';
const REFRESH_TOKEN_COOKIE = 'refreshToken';

export const saveTokensClient = (jwtToken: string, refreshToken: string) => {
    const jwtExpires = new Date(new Date().getTime() + 60 * 60 * 1000); // 1 час
    const refreshExpires = new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000); // 30 дней (месяц)
    Cookies.set(JWT_TOKEN_COOKIE, jwtToken, { path: '/', sameSite: 'lax', expires: jwtExpires });
    Cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, { path: '/', sameSite: 'lax', expires: refreshExpires });
};

export const getTokensClient = async () => {
    const jwtToken = Cookies.get(JWT_TOKEN_COOKIE) || null;
    const refreshToken = Cookies.get(REFRESH_TOKEN_COOKIE) || null;
    if (!jwtToken && refreshToken) {
        try {
            await executeRefreshTokens(refreshToken, onLoginError);
            const newJwtToken = Cookies.get(JWT_TOKEN_COOKIE) || null;
            const newRefreshToken = Cookies.get(REFRESH_TOKEN_COOKIE) || null;
            if (newJwtToken && newRefreshToken) {
                return { jwtToken: newJwtToken, refreshToken: newRefreshToken };
            } else {
                clearTokensClient();
                return null;
            }
        } catch (error) {
            clearTokensClient();
            return null;
        }
    }

    if (!jwtToken || !refreshToken) return null;
    return { jwtToken, refreshToken };
};

export const clearTokensClient = () => {
    Cookies.remove(JWT_TOKEN_COOKIE);
    Cookies.remove(REFRESH_TOKEN_COOKIE);
};
