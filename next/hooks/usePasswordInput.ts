import { useState } from "react";
import { useIcon } from "@/hooks/useIcon";

export const usePasswordInput = () => {
    const [hide, setHide] = useState(true);
    const type = hide ? 'password' : 'text';
    const icon = useIcon(hide ? 'password-hide' : 'password-show');

    const togglePassword = () => {
        setHide(prev => !prev)
    };

    return { type, icon, togglePassword };
};
