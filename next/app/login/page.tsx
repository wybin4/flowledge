"use client";

import { userApiClient } from "@/apiClient";
import { saveTokensClient } from "@/auth/tokens";
import { Input } from "@/components/InputBox/Input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoginResponse } from "../../types/LoginResponse";
import { Button, ButtonType } from "@/components/Button/Button";
import styles from "./page.module.css";
import { useTranslation } from "react-i18next";
import { useIcon } from "@/hooks/useIcon";

export default function LoginPage() {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const prefix = 'login.';
    const { t } = useTranslation();
    const logoIcon = useIcon('logo');

    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, setState: (state: string) => void) => {
        let value: number | string = e.target.value;
        setState(value);
    };

    const handleLogin = async () => {
        const { jwtToken, refreshToken } = await userApiClient.post<LoginResponse>(
            'auth/login', { username, password }
        );
        saveTokensClient(jwtToken, refreshToken);
        router.push('/');
    };

    return (
        <div className={styles.container}>
            <div className={styles.icon}>{logoIcon}</div>
            <div className={styles.formContainer}>
                <div className={styles.slogan}>{t(`${prefix}slogan`)}</div>
                <div className={styles.field}>
                    <div className={styles.fieldTitle}>{t(`${prefix}username`)}</div>
                    <Input type='text' value={username} onChange={(e) => handleChange(e, setUsername)} />
                </div>
                <div className={styles.field}>
                    <div className={styles.fieldTitle}>{t(`${prefix}password`)}</div>
                    <Input type='password' value={password} onChange={(e) => handleChange(e, setPassword)} />
                </div>
                <Button
                    title={t(`${prefix}button`)}
                    type={ButtonType.SAVE}
                    onClick={handleLogin}
                    className={styles.button}
                />
                <div className={styles.description}>{t(`${prefix}description`)}</div>
            </div>
        </div>
    );
}
