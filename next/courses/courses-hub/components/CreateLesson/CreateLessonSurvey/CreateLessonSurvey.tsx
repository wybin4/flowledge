"use client";

import RightSidebar from "@/components/Sidebar/RightSidebar/RightSidebar";
import { useTranslation } from "react-i18next";
import styles from "./CreateLessonSurvey.module.css";
import { useEffect, useState } from "react";
import { SurveyQuestionItem } from "./SurveyQuestion/SurveyQuestionItem/SurveyQuestionItem";
import cn from "classnames";
import { SurveyQuestion } from "@/courses/courses-hub/types/SurveyQuestion";
import { SurveyQuestionBody } from "./SurveyQuestion/SurveyQuestionBody/SurveyQuestionBody";
import { SortableList } from "@/components/Sortable/SortableList";
import { ChildrenPosition } from "@/types/ChildrenPosition";
import { useScrollToElement } from "@/hooks/useScrollToElement";
import { useAddQuestionToUrl } from "@/courses/courses-hub/hooks/useAddQuestionToUrl";
import { MenuButton } from "@/components/MenuButton/MenuButton";
import { ItemSize } from "@/types/ItemSize";
import { Button, ButtonType } from "@/components/Button/Button";
import { ButtonBack } from "@/components/Button/ButtonBack/ButtonBack";
import { StickyBottomBar } from "@/components/StickyBottomBar/StickyBottomBar";
import { coursesHubLessonsPrefixApi, coursesHubLessonsPrefixTranslate } from "@/helpers/prefixes";
import { FillBorderUnderlineMode } from "@/types/FillBorderUnderlineMode";
import { CreateLessonChildrenProps } from "../CreateLesson";
import { parseSurveyText } from "@/courses/courses-hub/functions/parseSurveyText";
import { LessonSaveType } from "@/courses/courses-hub/types/LessonToSave";
import { userApiClient } from "@/apiClient";
import { Survey } from "@/courses/courses-hub/types/Survey";
import { usePathname, useRouter } from "next/navigation";
import { removeLastSegment } from "@/helpers/removeLastSegment";
import { RightSidebarWithStickyActions } from "@/components/Sidebar/RightSidebar/RightSidebarWithStickyActions/RightSidebarWithStickyActions";

interface CreateLessonSurveyProps extends CreateLessonChildrenProps {
    selectedQuestionId?: string;
    questions?: string;
    survey?: Survey;
};

export const CreateLessonSurvey = ({ lessonId, selectedQuestionId, survey, questions: initialQuestions }: CreateLessonSurveyProps) => {
    const handleScrollToQuestion = useAddQuestionToUrl();

    const [questions, setQuestions] = useState<SurveyQuestion[]>([]);

    useEffect(() => {
        try {
            if (survey && survey.questions && survey.questions.length) {
                setQuestions(survey.questions);
                return;
            }
            if (initialQuestions) {
                const survey = parseSurveyText(initialQuestions);
                if (!survey.length) {
                    return;
                }
                setQuestions(survey);
            }
        } catch (e) {
            console.warn('Не удалось распарсить текст опроса')
        }
    }, [initialQuestions, JSON.stringify(survey)]);

    const canDeleteQuestions = questions.length > 1;

    const { t } = useTranslation();
    const router = useRouter();
    const currentPath = usePathname();

    const handleSetQuestion = (newQuestion?: SurveyQuestion, _id?: string) => {
        setQuestions(prevQuestions => {
            if (_id) {
                return prevQuestions.filter(question => question._id !== _id);
            } else if (newQuestion) {
                return prevQuestions.map(question =>
                    question._id === newQuestion._id ? newQuestion : question
                );
            }
            return prevQuestions;
        });
    }

    const handleAddQuestion = () => {
        const newId = String(Date.now())
        const newQuestion: SurveyQuestion = {
            _id: newId,
            title: t('type-here'),
            choices: []
        };
        setQuestions(prevQuestions => [...prevQuestions, newQuestion]);
        handleScrollToQuestion(newId);
    };

    useScrollToElement(selectedQuestionId);

    const saveLesson = () =>
        userApiClient.post(
            `${coursesHubLessonsPrefixApi}.create`, {
            type: LessonSaveType.Survey,
            _id: lessonId,
            questions
        }).then(_ => {
            router.push(removeLastSegment(currentPath));
        });

    return (
        <>
            <RightSidebarWithStickyActions
                sidebar={{
                    title: (<>
                        <div>{t('questions.name')} ({questions.length})</div>
                        <div
                            onClick={handleAddQuestion}
                            className={styles.titleButton}
                        >
                            {t('questions.add')}
                        </div>
                    </>),
                    body: _ => (
                        <SortableList
                            items={questions}
                            setItems={setQuestions}
                            buttonPosition={ChildrenPosition.Left}
                            className={styles.questionContainer}
                            renderItem={(item, index) => (
                                <SurveyQuestionItem
                                    key={index}
                                    _id={item._id}
                                    title={item.title}
                                    number={index + 1}
                                />
                            )}
                        />
                    ),
                    containerClassName: styles.container
                }}
                stickyBottomBar={{
                    actions: (<>
                        <ButtonBack hasBackButtonIcon={false} />
                        {JSON.stringify(initialQuestions) != JSON.stringify(questions) &&
                            <Button
                                onClick={saveLesson}
                                prefix={coursesHubLessonsPrefixTranslate}
                                type={ButtonType.SAVE}
                                mode={FillBorderUnderlineMode.UNDERLINE}
                                noEffects={true}
                            />
                        }
                    </>),
                    menuSize: ItemSize.Little,
                    body: questions.map((question, index) => (
                        <SurveyQuestionBody
                            key={index}
                            number={index + 1}
                            question={question}
                            setQuestion={handleSetQuestion}
                            canDeleteQuestions={canDeleteQuestions}
                        />
                    ))
                }}
            />
        </>
    )
};