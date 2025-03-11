import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type SidebarState = {
    left: boolean;
    right: boolean;
};

const getInitialState = (): SidebarState => {
    if (typeof window !== "undefined") {
        const stored = localStorage.getItem("sidebarState");
        return stored ? JSON.parse(stored) : { left: false, right: false };
    }
    return { left: false, right: false };
};

export const sidebarSlice = createSlice({
    name: "sidebar",
    initialState: getInitialState(),
    reducers: {
        toggleSidebar: (state, action: PayloadAction<"left" | "right">) => {
            state[action.payload] = !state[action.payload];
            localStorage.setItem("sidebarState", JSON.stringify(state));
        },
        setSidebar: (state, action: PayloadAction<{ sidebar: "left" | "right"; isExpanded: boolean }>) => {
            state[action.payload.sidebar] = action.payload.isExpanded;
            localStorage.setItem("sidebarState", JSON.stringify(state));
        },
    },
});

export const { toggleSidebar, setSidebar } = sidebarSlice.actions;
