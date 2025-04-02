import { getFormattedDateWithTime } from "@/helpers/getFormattedDateWithTime"
import { Course } from "../../types/Course"
import { CoursesHubTableItem } from "../types/CoursesHubTableItem"
import { TFunction } from "i18next"

export const mapCoursesHubToTable = (course: Course, locale: string, _: TFunction): CoursesHubTableItem => {
    return {
        _id: course._id,
        title: course.title,
        creator: course.u.name,
        createdAt: getFormattedDateWithTime(course.createdAt, locale),
        imageUrl: course.imageUrl
    }
}