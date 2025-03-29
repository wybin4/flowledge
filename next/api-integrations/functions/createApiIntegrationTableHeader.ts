import { SortablePosition } from "@/types/Sortable";
import { TFunction } from "i18next";

export const createApiIntegrationTableHeader = (t: TFunction, onSort: (name: string, position?: SortablePosition) => void) => {
    const prefix = 'api-integrations.';
    const items = [
        { name: 'name' },
        { name: 'status' },
        { name: 'creator' },
        {
            name: 'createdAt', isSortable: true,
            onSort: (position?: SortablePosition) => {
                onSort('createdAt', position);
            }
        }
    ];
    return items.map(item => ({ name: t(`${prefix}${item.name}`), isSortable: item.isSortable, onSort: item.onSort }));
}