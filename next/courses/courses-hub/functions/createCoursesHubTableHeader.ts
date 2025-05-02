import { TopBottomPosition } from "@/types/Sortable";
import { TFunction } from "i18next";
import { coursesHubPrefix } from "@/helpers/prefixes";
import { SortableTableHeader } from "@/types/SortableTableHeader";

export const createCoursesHubTableHeader = (t: TFunction, onSort: (name: string, position?: TopBottomPosition) => void): SortableTableHeader[] => {
    const items = [
        { name: 'imageUrl' },
        { name: 'title' },
        { name: 'creator' },
        {
            name: 'createdAt', isSortable: true,
            onSort: (position?: TopBottomPosition) => {
                onSort('createdAt', position);
            }
        }
    ];
    return items.map(item => ({ name: t(`${coursesHubPrefix}.${item.name}`), isSortable: item.isSortable, onSort: item.onSort }));
}