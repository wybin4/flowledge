import styles from "./CoursesListItemComments.module.css";
import { useTranslation } from "react-i18next";
import { handlePluralTranslation } from "@/helpers/handlePluralTranslation";
import { useUserSetting } from "@/user/hooks/useUserSetting";
import { coursesListPrefix } from "@/helpers/prefixes";
import { Language } from "@/user/types/Language";

type CoursesListItemCommentsProps = {
    className?: string;
    comments: string[];
}

export const CoursesListItemComments = ({ className, comments }: CoursesListItemCommentsProps) => {
    const { t } = useTranslation();
    const commentsCount = comments.length;
    const locale = useUserSetting<Language>('language') || Language.EN;
    const commentsCountText = handlePluralTranslation(
        `${coursesListPrefix}.comments`, t, commentsCount, 'comments', locale
    );

    return (
        <div className={className}>
            <h3>{commentsCountText}</h3>
            <div className={styles.commentsContainer}>
                {comments.map((comment) => (
                    <div key={comment} className={styles.comment}>
                        {comment}
                    </div>
                ))}
            </div>
        </div>
    );
};
