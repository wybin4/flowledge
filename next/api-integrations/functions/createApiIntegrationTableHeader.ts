import { TopBottomPosition } from "@/types/Sortable";
import { TFunction } from "i18next";
import { apiIntegrationsPrefix } from "@/helpers/prefixes";

export const createApiIntegrationTableHeader = (t: TFunction, onSort: (name: string, position?: TopBottomPosition) => void) => {
    const items = [
        { name: 'title' },
        { name: 'status' },
        { name: 'creator' },
        { name: 'entity', hasNamePostfix: true },
        {
            name: 'createdAt', isSortable: true,
            onSort: (position?: TopBottomPosition) => {
                onSort('createdAt', position);
            }
        }
    ];
    return items.map(item => (
        {
            name: t(`${apiIntegrationsPrefix}.${item.name}${item.hasNamePostfix ? '.name' : ''}`),
            isSortable: item.isSortable,
            onSort: item.onSort
        }));
}