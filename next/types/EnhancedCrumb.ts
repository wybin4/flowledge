import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export type EnhancedCrumb = {
    name: string;
    checked: boolean;
    current: boolean;
    onClick?: (router: AppRouterInstance) => void;
};
