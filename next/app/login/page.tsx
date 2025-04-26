"use client";

import { userApiClient } from "@/apiClient";
import { getTokens, saveTokens } from "@/collections/CachedCollection";
import { Input } from "@/components/InputBox/Input";
import { useState } from "react";

export default function LoginPage() {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, setState: (state: string) => void) => {
        let value: number | string = e.target.value;
        setState(value);
    };

    const handleUsername = async () => {
        const { jwtToken, refreshToken } = await userApiClient.post('auth/login', { username, password });
        saveTokens(jwtToken, refreshToken);
        console.log(getTokens())
    };

    return (
        <>
            <Input type='text' value={username} onChange={(e) => handleChange(e, setUsername)} />
            <Input type='password' value={password} onChange={(e) => handleChange(e, setPassword)} />
            <button onClick={handleUsername}>login</button>
        </>
    );
}
