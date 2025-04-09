import { useState, useEffect } from "react";

export function useDebouncedSave<T>(
    initialValue: T,
    delay: number,
    onSave: (value: T) => void
): [T, (newValue: T) => void] {
    const [inputValue, setInputValue] = useState(initialValue);
    const [lastSavedValue, setLastSavedValue] = useState(initialValue);

    useEffect(() => {
        if (inputValue === lastSavedValue) return;

        const handler = setTimeout(() => {
            onSave(inputValue);
            setLastSavedValue(inputValue);
        }, delay);

        return () => clearTimeout(handler);
    }, [inputValue, lastSavedValue, delay, onSave]);

    useEffect(() => {
        setInputValue(initialValue);
        setLastSavedValue(initialValue);
    }, [initialValue]);

    return [inputValue, setInputValue];
}
