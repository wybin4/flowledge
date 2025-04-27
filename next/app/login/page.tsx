"use client";

import { userApiClient } from "@/apiClient";
import { saveTokensClient } from "@/auth/tokens";
import { Input } from "@/components/InputBox/Input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoginResponse } from "../../types/LoginResponse";

export default function LoginPage() {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, setState: (state: string) => void) => {
        let value: number | string = e.target.value;
        setState(value);
    };

    const handleUsername = async () => {
        const { jwtToken, refreshToken } = await userApiClient.post<LoginResponse>(
            'auth/login', { username, password }
        );
        saveTokensClient(jwtToken, refreshToken);
        router.push('/');
    };

    return (
        <>
            <Input type='text' value={username} onChange={(e) => handleChange(e, setUsername)} />
            <Input type='password' value={password} onChange={(e) => handleChange(e, setPassword)} />
            <button onClick={handleUsername}>login</button>
        </>
    );
}
