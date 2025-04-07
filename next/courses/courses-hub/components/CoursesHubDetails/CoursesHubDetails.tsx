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
import { Breadcrumbs } from "@/components/Breadcrumbs/Breadcrumbs";
import { ChildrenPosition } from "@/types/ChildrenPosition";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { userApiClient } from "@/apiClient";
import { Section } from "@/courses/types/Section";

export const CoursesHubDetails = ({ course }: { course: CoursesHubDetail }) => {
    const [newSection, setNewSection] = useState<string | undefined>(undefined);

    const { t } = useTranslation();

    const locale = useUserSetting<Language>('language') || Language.EN;
    const countSections = course.sections?.length || 0;
    const countLessons = course.sections?.reduce((acc, section) => acc + (section.lessons?.length || 0), 0) || 0;
    const countSectionsText = handlePluralTranslation(coursesHubPrefix, t, countSections, 'sections', locale);
    const countLessonsText = handlePluralTranslation(coursesHubPrefix, t, countLessons, 'lessons', locale);

    const router = useRouter();

    const actions: CollapsibleSectionActionProps[] = [
        {
            title: `+ ${t(`${coursesHubPrefix}.add-lesson`)}`,
            onClick: () => { router.push(`/courses-hub/${course._id}?createLesson=true`); },
            type: ChildrenPosition.Bottom
        },
        {
            title: 'dsfsdf1',
            onClick: () => { },
            type: ChildrenPosition.Right
        },
        {
            title: 'dsfsdf2',
            onClick: () => { },
            type: ChildrenPosition.Right
        }
    ];

    const handleAddSection = () => {
        setNewSection('');
    };

    const handleSaveNewSection = async (_id?: string) => {
        const result = await userApiClient<Section>({
            url: `${coursesHubPrefix}/sections.${_id ? `update/${_id}` : 'create'}`,
            options: {
                method: 'POST', body: JSON.stringify({
                    title: newSection,
                    courseId: course._id
                })
            }
        });
        if (result) {
            if (_id) {
                course.sections?.map(section => {
                    if (section.section._id === result._id) {
                        section.section.title = result.title;
                    }
                    return section;
                });
            } else {
                course.sections?.push({
                    section: {
                        _id: result._id,
                        title: result.title
                    }, lessons: []
                });
            }
            setNewSection(undefined);
        }
    };

    return (
        <>
            <CoursesItemHeader
                course={course}
                header={<Breadcrumbs position={ChildrenPosition.Left} currentPathName={t(`${coursesHubPrefix}.current-course`)} />}
                pointer={false}
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
                    onClick={handleAddSection}
                />
                {newSection !== undefined &&
                    <CourseSection
                        section={newSection}
                        className={styles.newSection}
                        setNewSection={setNewSection}
                        onSaveNewSection={() => handleSaveNewSection()}
                    />
                }
                {course.sections && course.sections.length > 0 && course.sections.map(section => (
                    <CourseSection
                        key={section.section._id}
                        section={section}
                        actions={actions}
                        className={styles.section}
                    />
                ))}
            </div>
        </>
    );
};