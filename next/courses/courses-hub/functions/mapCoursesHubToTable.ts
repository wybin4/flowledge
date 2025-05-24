import { getFormattedDateWithTime } from "@/helpers/getFormattedDateWithTime"
import { Course } from "../../types/Course"
import { CoursesHubTableItem } from "../types/CoursesHubTableItem"
import { TFunction } from "i18next"
import { getPublicationStatus } from "./getPublicationStatus"

export const mapCoursesHubToTable = (course: Course, locale: string, t: TFunction): CoursesHubTableItem => {
    return {
        _id: course._id,
        title: course.title,
        creator: course.u.name,
        createdAt: getFormattedDateWithTime(course.createdAt, locale),
        isPublished: getPublicationStatus(t, course.isPublished),
        imageUrl: course.imageUrl,
        versionId: course.versionId,
        versionName: course.versionName
    }
}