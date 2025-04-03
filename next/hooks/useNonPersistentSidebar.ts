import { toggleSidebar } from "@/redux/sidebarSlice";

import { useState } from "react";

import { useSelector } from "react-redux";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { setSidebar } from "@/redux/sidebarSlice";
import { SidebarPosition } from "@/types/SidebarPosition";

export const useNonPersistentSidebar = (position: SidebarPosition, parentState?: boolean, childState?: boolean) => {
    const dispatch = useDispatch();
    const isExpanded = useSelector((state: RootState) => state.sidebar[position]);

    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        setHydrated(true);
        if (parentState !== undefined) {
            dispatch(setSidebar({ sidebar: position, isExpanded: parentState }));
        }
        if (childState !== undefined) {
            dispatch(setSidebar({ sidebar: position, isExpanded: childState }));
        }
    }, [dispatch, position, parentState, childState]);

    const handleToggle = () => {
        dispatch(toggleSidebar(position));
    };

    return { isExpanded, hydrated, toggleSidebar: handleToggle };
};
