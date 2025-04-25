import { CallbackUsage, RemoveStateCallbacks, SetStateCallbacks } from '@/types/StateCallback';
import { Identifiable } from '@/types/Identifiable';
import { useEffect } from 'react';

export function useStateUpdate<T extends Identifiable>(
    searchQuery: string,
    setData: React.Dispatch<React.SetStateAction<T[]>>,
    setStateCallbacks: SetStateCallbacks<T>,
    removeStateCallbacks: RemoveStateCallbacks<T>,
) {
    useEffect(() => {
        const updateCallback = (newItems: T[], _regex?: string, usage: CallbackUsage = CallbackUsage.MANY) => {
            setData((prevData) => {
                const regex = searchQuery ? new RegExp(searchQuery, "i") : null;

                const filteredItems = regex
                    ? newItems.filter((item) => regex.test(item._id))
                    : newItems;

                if (usage === CallbackUsage.MANY) {
                    return filteredItems;
                }

                if (filteredItems.length === 1) {
                    const existingItem = prevData.find(p => p._id === filteredItems[0]._id);
                    if (existingItem) {
                        return prevData.map(p => (p._id === filteredItems[0]._id ? filteredItems[0] : p));
                    } else {
                        return [...prevData, filteredItems[0]];
                    }
                }

                return prevData;
            });
        };

        setStateCallbacks(updateCallback, searchQuery);
        return () => {
            removeStateCallbacks(updateCallback);
        };
    }, [setData, searchQuery, setStateCallbacks, removeStateCallbacks]);
}
