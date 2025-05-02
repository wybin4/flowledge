import { TopBottomPosition } from "./Sortable";

export type SortableTableHeader = {
    name: string;
    isSortable: boolean | undefined;
    onSort: ((position?: TopBottomPosition) => void) | undefined;
};