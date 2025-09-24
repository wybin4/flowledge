import { EnhancedItemSettingKey } from "@/components/TablePage/EnhancedTablePage/EnhancedItem/EnhancedItem";
import { CourseTag } from "@/courses/types/CourseTag";
import { coursesHubPrefix } from "@/helpers/prefixes";
import { SettingType } from "@/types/Setting";

export const getTagsSettingKey = (tags: CourseTag[]): EnhancedItemSettingKey => (
    {
        name: 'tags',
        i18nLabel: 'tags',
        types: [SettingType.SelectorInfiniteMultiple],
        additionalProps: {
            options: tags.map(t => ({ value: t.id, label: t.name })),
            prefix: coursesHubPrefix,
            selectedKey: 'tags_selected'
        }
    }
);