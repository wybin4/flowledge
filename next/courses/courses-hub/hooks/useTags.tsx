import { userApiClient } from "@/apiClient";
import { CourseTag } from "@/courses/types/CourseTag";
import { courseTagsPrefix } from "@/helpers/prefixes";
import { useEffect, useState } from "react";

export const useTags = () => {
    const [tags, setTags] = useState<CourseTag[]>([]);

    useEffect(() => {
        userApiClient.get<CourseTag[]>(`${courseTagsPrefix}.get`).then(items => {
            if (items && items.length) {
                setTags(items);
            }
        });
    }, []);

    return { tags, setTags };
};