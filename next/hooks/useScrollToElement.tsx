import { useEffect } from "react";

export const useScrollToElement = (elementId?: string) => {
    useEffect(() => {
        if (elementId) {
            const element = document.getElementById(elementId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, [elementId]);
};