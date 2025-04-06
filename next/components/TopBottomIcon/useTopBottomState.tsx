import { TopBottomPosition } from "@/types/Sortable";

export const useTopBottomState = (
    state: TopBottomPosition | undefined,
    setState: (state: TopBottomPosition | undefined) => void,
    onToggle?: (state: TopBottomPosition | undefined) => void
) => {
    let newSortState = state;
    if (state === TopBottomPosition.TOP) {
        newSortState = TopBottomPosition.BOTTOM;
    } else if (state === TopBottomPosition.BOTTOM) {
        newSortState = undefined;
    } else {
        newSortState = TopBottomPosition.TOP;
    }
    onToggle?.(newSortState);
    setState(newSortState);
}