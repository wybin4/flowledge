import { SectionItem } from "@/courses/types/SectionItem";
import CollapsibleSection from "@/components/CollapsibleSection/CollapsibleSection";
import CollapsibleSectionChild from "@/components/CollapsibleSection/CollapsibleSectionChild";
import styles from "./CourseSection.module.css";
import { CourseListImage } from "../../courses-list/components/CoursesListPageItem/CourseListImage/CourseListImage";
import { useRouter } from "next/navigation";
import { CollapsibleSectionActionProps } from "@/components/CollapsibleSection/CollapsibleSectionAction";
import { SectionToSave } from "@/courses/courses-hub/types/SectionToSave";

type CourseSectionProps = {
    className?: string;
    section: SectionItem | SectionToSave;
    setNewSection?: (section: SectionToSave) => void;
    onSaveNewSection?: () => void;
    actions?: CollapsibleSectionActionProps[];
}

export const CourseSection = ({ className, section, actions, setNewSection, onSaveNewSection }: CourseSectionProps) => {
    const router = useRouter();

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

    const sectionActionsClassNames = {
        className: styles.sectionAction,
        titleClassName: styles.sectionActionTitle
    };

    const sectionActions = actions?.map((action) => ({
        ...action,
        ...sectionActionsClassNames
    }));

    const defaultChildProps = { isActive: false };

    const onLessonClick = (id: string) => router.push(`${window.location.pathname}/${id}`);

    if (typeof section === 'string') {
        return (
            <CollapsibleSection
                title={section}
                setTitle={(name) => setNewSection?.(name)}
                expandedByDefault={false}
                iconPrefix='-little'
                isOnlyEdit={true}
                onEdit={onSaveNewSection}
                {...sectionClassNames}>
            </CollapsibleSection>
        )
    }

    if (typeof section === 'object' && 'section' in section) {
        return (
            <CollapsibleSection
                title={section.section.title}
                expandedByDefault={true}
                iconPrefix='-little'
                actions={sectionActions}
                {...sectionClassNames}>
                {section.lessons && section.lessons.length > 0 && section.lessons.map((lesson) => (
                    <CollapsibleSectionChild
                        id={lesson._id}
                        onClick={onLessonClick}
                        key={lesson._id}
                        title={lesson.title}
                        time={lesson.time}
                        additionalInfo={lesson.additionalInfo}
                        isViewed={false}
                        isLocked={false}
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
                ))}
            </CollapsibleSection>
        );
    }
};
