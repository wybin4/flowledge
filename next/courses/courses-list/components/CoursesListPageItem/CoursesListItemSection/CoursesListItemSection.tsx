import { SectionItem } from "@/courses/courses-list/types/SectionItem";
import CollapsibleSection from "@/components/CollapsibleSection/CollapsibleSection";
import CollapsibleSectionChild from "@/components/CollapsibleSection/CollapsibleSectionChild";
import styles from "./CoursesListItemSection.module.css";
import { CourseListImage } from "../CourseListImage/CourseListImage";
import { useRouter } from "next/navigation";

type CoursesListItemSectionProps = {
    className?: string;
    section: SectionItem;
}

export const CoursesListItemSection = ({ className, section }: CoursesListItemSectionProps) => {
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

    const defaultChildProps = { isActive: false };

    const onLessonClick = (id: string) => router.push(`${window.location.pathname}/${id}`);

    return (
        <CollapsibleSection title={section.title} expandedByDefault={true} iconPrefix='-little' {...sectionClassNames}>
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
                    image={lesson.imageUrl && <CourseListImage imageUrl={lesson.imageUrl} title={lesson.title} size='medium' />}
                    {...childClassNames}
                    {...defaultChildProps}
                />
            ))}
        </CollapsibleSection>
    );
};
