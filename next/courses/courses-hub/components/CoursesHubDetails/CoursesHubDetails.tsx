"use client";

import { CoursesItemHeader } from "@/courses/components/CoursesItemHeader/CoursesItemHeader";
import { CoursesListItemDescription } from "@/courses/components/CoursesListItemDescription/CoursesListItemDescription";
import { CoursesHubEditors } from "./CoursesHubEditors/CoursesHubEditors";
import { CoursesHubDetail } from "../../types/CoursesHubDetails";
import { CourseSection } from "@/courses/components/CourseSection/CourseSection";
import { coursesHubPrefix } from "@/helpers/prefixes";
import { useTranslation } from "react-i18next";
import styles from "./CoursesHubDetails.module.css";
import { CoursesHubDetailsHeader } from "./CoursesHubDetailsHeader/CoursesHubDetailsHeader";
import { handlePluralTranslation } from "@/helpers/handlePluralTranslation";
import { useUserSetting } from "@/user/hooks/useUserSetting";
import { Language } from "@/user/types/Language";
import { CollapsibleSectionActionProps } from "@/components/CollapsibleSection/CollapsibleSectionAction";

export const CoursesHubDetails = ({ course }: { course: CoursesHubDetail }) => {
    const { t } = useTranslation();

    const locale = useUserSetting<Language>('language') || Language.EN;
    const countSections = course.sections?.length || 0;
    const countLessons = course.sections?.reduce((acc, section) => acc + (section.lessons?.length || 0), 0) || 0;
    const countSectionsText = handlePluralTranslation(coursesHubPrefix, t, countSections, 'sections', locale);
    const countLessonsText = handlePluralTranslation(coursesHubPrefix, t, countLessons, 'lessons', locale);

    const actions: CollapsibleSectionActionProps[] = [
        {
            title: `+ ${t(`${coursesHubPrefix}.add-lesson`)}`,
            onClick: () => { }
        }
    ];

    return (
        <>
            <CoursesItemHeader
                course={course}
            />
            <CoursesListItemDescription
                description={course.description}
                isExpanded={true}
            />
            <CoursesHubDetailsHeader
                title={t(`${coursesHubPrefix}.editors`)}
                action={`+ ${t(`${coursesHubPrefix}.add-editor`)}`}
                onClick={() => { }}
            />
            {course.editors && course.editors.length > 0 && <CoursesHubEditors editors={course.editors} />}
            <div className={styles.sectionsContainer}>
                <CoursesHubDetailsHeader
                    title={t(`${coursesHubPrefix}.sections`)}
                    description={`${countSectionsText} · ${countLessonsText}`}
                    action={`+ ${t(`${coursesHubPrefix}.add-section`)}`}
                    onClick={() => { }}
                />
                {course.sections && course.sections.length > 0 && course.sections.map(section => (
                    <CourseSection key={section._id} section={section} actions={actions} />
                ))}
            </div>
        </>
    );
};