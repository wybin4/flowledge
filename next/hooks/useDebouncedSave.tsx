import { useState, useEffect, useCallback } from "react";

export function useDebouncedSave<T>(value: T, delay: number, onSave: (value: T) => void) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
            onSave(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay, onSave]);

    const updateValue = useCallback((newValue: T) => {
        setDebouncedValue(newValue);
    }, []);

    return [debouncedValue, updateValue] as const;
}
