import { TopBottomPosition } from "@/types/Sortable";
import { TFunction } from "i18next";
import { courseTagsPrefix } from "@/helpers/prefixes";

export const createCourseTagsTableHeader = (t: TFunction, onSort: (name: string, position?: TopBottomPosition) => void) => {
    const items = [
        {
            name: 'name.name', isSortable: true,
            onSort: (position?: TopBottomPosition) => {
                onSort('name', position);
            }
        }
    ];
    return items.map(item => ({ name: t(`${courseTagsPrefix}.${item.name}`), isSortable: item.isSortable, onSort: item.onSort }));
}