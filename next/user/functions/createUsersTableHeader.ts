import { TopBottomPosition } from "@/types/Sortable";
import { TFunction } from "i18next";
import { usersPrefix } from "@/helpers/prefixes";
import { SortableTableHeader } from "@/types/SortableTableHeader";

export const createUsersTableHeader = (t: TFunction, onSort: (name: string, position?: TopBottomPosition) => void): SortableTableHeader[] => {
    const items = [
        { name: 'avatar' },
        {
            name: 'name', isSortable: true,
            onSort: (position?: TopBottomPosition) => {
                onSort('name', position);
            }
        },
        {
            name: 'username', isSortable: true,
            onSort: (position?: TopBottomPosition) => {
                onSort('username', position);
            }
        },
        { name: 'roles' },
        { name: 'status' },
    ];
    return items.map(item => ({ name: t(`${usersPrefix}.${item.name}`), isSortable: item.isSortable, onSort: item.onSort }));
}