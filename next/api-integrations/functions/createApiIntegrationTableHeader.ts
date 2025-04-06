import { TopBottomPosition } from "@/types/Sortable";
import { TFunction } from "i18next";
import { apiIntegrationsPrefix } from "@/helpers/prefixes";

export const createApiIntegrationTableHeader = (t: TFunction, onSort: (name: string, position?: TopBottomPosition) => void) => {
    const items = [
        { name: 'name' },
        { name: 'status' },
        { name: 'creator' },
        {
            name: 'createdAt', isSortable: true,
            onSort: (position?: TopBottomPosition) => {
                onSort('createdAt', position);
            }
        }
    ];
    return items.map(item => ({ name: t(`${apiIntegrationsPrefix}.${item.name}`), isSortable: item.isSortable, onSort: item.onSort }));
}