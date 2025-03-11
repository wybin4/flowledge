"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toggleSidebar, setSidebar } from "@/redux/sidebarSlice";

type SidebarPosition = "left" | "right";

export const useSidebar = (position: SidebarPosition) => {
    const dispatch = useDispatch();
    const isExpanded = useSelector((state: RootState) => state.sidebar[position]);

    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        setHydrated(true);
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("sidebarState");
            if (stored) {
                try {
                    const parsedState = JSON.parse(stored);
                    if (typeof parsedState[position] === "boolean") {
                        dispatch(setSidebar({ sidebar: position, isExpanded: parsedState[position] }));
                    }
                } catch (error) {
                    console.error("Failed to parse sidebarState from localStorage", error);
                }
            }
        }
    }, [dispatch, position]);

    const handleToggle = () => {
        dispatch(toggleSidebar(position));
    };

    return { isExpanded, hydrated, toggleSidebar: handleToggle };
};
