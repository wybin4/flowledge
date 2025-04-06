export type Sortable = {
    name: string;
    isSortable?: boolean;
    onSort?: (position?: TopBottomPosition) => void;
}

export enum TopBottomPosition {
    TOP = 'top',
    BOTTOM = 'bottom'
}
