import { useState, useEffect } from "react";
import { SetStateCallbacks, RemoveStateCallbacks } from "@/types/StateCallback";
import { Identifiable } from "@/types/Identifiable";
import { useStateUpdate } from "./useStateUpdate";

export const useDataManagement = <T extends Identifiable>({
    searchQuery,
    setStateCallbacks,
    removeStateCallbacks,
    onSetData
}: {
    searchQuery: string;
    setStateCallbacks?: SetStateCallbacks<T>;
    removeStateCallbacks?: RemoveStateCallbacks<T>;
    onSetData?: (data: T[]) => void;
}) => {
    const [data, setData] = useState<T[]>([]);

    if (setStateCallbacks && removeStateCallbacks) {
        useStateUpdate<T>(searchQuery, setData, setStateCallbacks, removeStateCallbacks);
    }

    useEffect(() => {
        onSetData?.(data);
    }, [data]);

    return {
        data,
        setData
    };
};