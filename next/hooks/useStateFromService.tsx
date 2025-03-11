import EventEmitter from "events";
import { useState, useCallback, useEffect } from "react";

type EventHandler<T> = (newState: T | undefined) => void;

export const useStateFromService = <T,>(
    getValue: () => T | undefined,
    eventName: string,
    service: EventEmitter,
    handleStateChange: EventHandler<T>
): T | undefined => {
    const [stateValue, setStateValue] = useState<T | undefined>(undefined);

    const updateStateValue = useCallback(() => {
        const newStateValue = getValue();
        setStateValue(newStateValue);
    }, [getValue]);

    useEffect(() => {
        updateStateValue();

        service.on(eventName, handleStateChange);

        return () => {
            service.off(eventName, handleStateChange);
        };
    }, [eventName, handleStateChange, service, updateStateValue]);

    return stateValue;
};