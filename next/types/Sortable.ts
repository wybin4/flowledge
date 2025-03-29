export type Sortable = {
    name: string;
    isSortable?: boolean;
    onSort?: (position?: SortablePosition) => void;
}

export enum SortablePosition {
    TOP = 'top',
    BOTTOM = 'bottom'
}
