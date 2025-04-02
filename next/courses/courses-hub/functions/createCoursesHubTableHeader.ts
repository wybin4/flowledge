import { SortablePosition } from "@/types/Sortable";
import { TFunction } from "i18next";
import { coursesHubPrefix } from "@/helpers/prefixes";

export const createCoursesHubTableHeader = (t: TFunction, onSort: (name: string, position?: SortablePosition) => void) => {
    const items = [
        { name: 'imageUrl' },
        { name: 'title' },
        { name: 'creator' },
        {
            name: 'createdAt', isSortable: true,
            onSort: (position?: SortablePosition) => {
                onSort('createdAt', position);
            }
        }
    ];
    return items.map(item => ({ name: t(`${coursesHubPrefix}.${item.name}`), isSortable: item.isSortable, onSort: item.onSort }));
}