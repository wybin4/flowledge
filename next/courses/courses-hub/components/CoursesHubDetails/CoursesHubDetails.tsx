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
import { useSaveItem } from "@/hooks/useSaveItem";
import { SectionToSave } from "../../types/SectionToSave";
import { SectionItem } from "@/courses/types/SectionItem";
import RightSidebar from "@/components/Sidebar/RightSidebar";
import cn from "classnames";
import { useNonPersistentSidebar } from "@/hooks/useNonPersistentSidebar";

export const CoursesHubDetails = ({ course }: { course: CoursesHubDetail }) => {
    const [courseSections, setCourseSections] = useState<SectionItem[]>(course.sections || []);
    const [newSection, setNewSection] = useState<string | undefined>(undefined);

    const { t } = useTranslation();

    const locale = useUserSetting<Language>('language') || Language.EN;
    const countSections = courseSections.length || 0;
    const countLessons = courseSections.reduce((acc, section) => acc + (section.lessons?.length || 0), 0) || 0;
    const countSectionsText = handlePluralTranslation(coursesHubPrefix, t, countSections, 'sections', locale);
    const countLessonsText = handlePluralTranslation(coursesHubPrefix, t, countLessons, 'lessons', locale);

    const sectionPrefix = `${coursesHubPrefix}/sections`;

    const router = useRouter();

    const bottomActions: CollapsibleSectionActionProps[] = [
        {
            title: `+ ${t(`${coursesHubPrefix}.add-lesson`)}`,
            onClick: () => { router.push(`/courses-hub/${course._id}?createLesson=true`); },
            type: ChildrenPosition.Bottom
        }
    ];

    const handleAddSection = () => {
        setNewSection('');
    };

    const handleSaveNewSection = async (_id?: string) => {
        if (newSection) {
            const result = await useSaveItem<Section, SectionToSave>({
                isCreate: _id ? false : true,
                prefix: sectionPrefix,
                apiClient: userApiClient,
                _id,
                item: {
                    title: newSection,
                    courseId: course._id
                } as unknown as Section
            });
            if (result) {
                if (_id) {
                    setCourseSections(courseSections.map(section => {
                        if (section.section._id === result._id) {
                            section.section.title = result.title;
                        }
                        return section;
                    }));
                } else {
                    setCourseSections([...courseSections, {
                        section: result, lessons: []
                    }]);
                }
                setNewSection(undefined);
            }
        }
    };

    return (
        <RightSidebar
            useSidebarHook={useNonPersistentSidebar}
            content={classNames => <div className={cn(classNames)}>sdfsdf</div>}
        >
            {(isExpanded, onClick) => (
                <div className={cn({ [styles.expanded]: isExpanded })}>
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
                        {courseSections && courseSections.length > 0 && courseSections.map(section => (
                            <CourseSection
                                key={section.section._id}
                                section={section}
                                actions={[...bottomActions, {
                                    title: t('edit'),
                                    type: ChildrenPosition.Right,
                                    onClick
                                }]}
                                className={styles.section}
                            />
                        ))}
                    </div>
                </div>
            )}
        </RightSidebar>
    );
};