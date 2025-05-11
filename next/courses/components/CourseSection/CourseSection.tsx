import { SectionItem } from "@/courses/types/SectionItem";
import CollapsibleSection, { CollapsibleSectionTagType } from "@/components/CollapsibleSection/CollapsibleSection";
import CollapsibleSectionChild from "@/components/CollapsibleSection/CollapsibleSectionChild";
import styles from "./CourseSection.module.css";
import { CourseListImage } from "../../courses-list/components/CoursesListItem/CourseListImage/CourseListImage";
import { CollapsibleSectionActionProps } from "@/components/CollapsibleSection/CollapsibleSectionAction";
import { ChildrenPosition } from "@/types/ChildrenPosition";
import { useTranslation } from "react-i18next";
import { useTranslatedTime } from "@/hooks/useTranslatedTime";
import { ValidateSectionTitle } from "@/courses/courses-hub/components/CoursesHubDetails/CoursesHubDetails";
import { CourseLessonItem } from "@/courses/courses-list/types/CourseLessonItem";

type CourseSectionProps = {
    className?: string;
    section: SectionItem | string;
    setNewSection?: (section: string) => void;
    onSaveNewSection?: () => void;
    actions?: CollapsibleSectionActionProps[];
    validateSectionTitle?: ValidateSectionTitle;
    sectionTitleError?: string;
    setLesson?: (lesson: CourseLessonItem) => void;
}

export const CourseSection = ({
    section, setNewSection, onSaveNewSection,
    validateSectionTitle, sectionTitleError,
    actions, setLesson,
    className,
}: CourseSectionProps) => {
    const { t } = useTranslation();
    const translateTime = useTranslatedTime();

    const sectionClassNames = {
        containerClassName: className,
        headerClassName: styles.header,
        contentClassName: styles.content
    };

    const childClassNames = {
        childClassName: styles.child,
        titleContainerClassName: styles.childTitleContainer,
        titleClassName: styles.childTitle,
        timeClassName: styles.childTime,
        additionalInfoClassName: styles.childAdditionalInfo
    };

    const sectionActionsClassNamesBottom = {
        className: styles.sectionActionBottom,
        titleClassName: styles.sectionActionTitle
    };

    const sectionActionsClassNamesRight = {
        className: styles.sectionActionRight,
        titleClassName: styles.sectionActionTitle
    };

    const sectionActions = actions?.map((action) => ({
        ...action,
        ...(action.type === ChildrenPosition.Bottom ? sectionActionsClassNamesBottom : {}),
        ...(action.type === ChildrenPosition.Right ? sectionActionsClassNamesRight : {})
    }));

    const defaultChildProps = { isActive: false };

    if (typeof section === 'string') {
        return (
            <CollapsibleSection
                title={section}
                expandedByDefault={false}
                iconPrefix='-little'
                setTitle={(name) => setNewSection?.(name)}
                onTitleSave={onSaveNewSection}
                isEditTitle={true}
                validateTitle={validateSectionTitle}
                titleError={sectionTitleError}
                {...sectionClassNames}>
            </CollapsibleSection>
        )
    }

    if (typeof section === 'object' && 'section' in section) {
        return (
            <CollapsibleSection
                title={section.section.title}
                titleTags={[...(!section.section.isVisible ? [{
                    title: t('invisible'), type: CollapsibleSectionTagType.Warning
                }] : [])]}
                expandedByDefault={true}
                iconPrefix='-little'
                actions={sectionActions}
                {...sectionClassNames}>
                {(section.lessons && section.lessons.length > 0) ? section.lessons.map((lesson) => (
                    <CollapsibleSectionChild
                        id={lesson._id}
                        onClick={() => setLesson?.(lesson)}
                        key={lesson._id}
                        title={lesson.title}
                        time={translateTime(lesson.time) || lesson.time}
                        additionalInfo={lesson.additionalInfo}
                        isViewed={false}
                        titleTags={[...(!lesson.isVisible ? [{
                            title: t('invisible'), type: CollapsibleSectionTagType.Warning
                        }] : [])]}
                        image={lesson.imageUrl &&
                            <CourseListImage
                                imageUrl={lesson.imageUrl}
                                title={lesson.title}
                                size='medium'
                            />
                        }
                        {...childClassNames}
                        {...defaultChildProps}
                    />
                )) : undefined}
            </CollapsibleSection>
        );
    }
};
