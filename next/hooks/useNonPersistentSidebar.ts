import { useState, useEffect } from 'react';
import { SidebarPosition } from "@/types/SidebarPosition";

export const useNonPersistentSidebar = (
    position: SidebarPosition, parentState?: boolean, childState?: boolean
) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        setHydrated(true);
        const initialValue = parentState ?? childState ?? false;
        setIsExpanded(initialValue);
    }, [position, parentState, childState]);

    useEffect(() => {
        return () => {
            setIsExpanded(false);
            setHydrated(false);
        };
    }, [position]);

    const handleToggle = () => {
        setIsExpanded(prev => !prev);
    };

    return { isExpanded, hydrated, toggleSidebar: handleToggle };
};
