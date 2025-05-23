import { coursesHubPrefix } from "@/helpers/prefixes";
import { TFunction } from "i18next";

export function getPublicationStatus(t: TFunction, isPublished?: boolean): string {
    return isPublished ? t(`${coursesHubPrefix}.published`) : t(`${coursesHubPrefix}.unpublished`);
}