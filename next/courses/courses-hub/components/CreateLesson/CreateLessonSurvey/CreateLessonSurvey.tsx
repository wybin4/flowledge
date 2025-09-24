"use client";

import { useTranslation } from "react-i18next";
import styles from "./CreateLessonSurvey.module.css";
import { useEffect, useState } from "react";
import { SurveyQuestionItem } from "./SurveyQuestion/SurveyQuestionItem/SurveyQuestionItem";
import { SurveyQuestion } from "@/courses/courses-hub/types/SurveyQuestion";
import { SurveyQuestionBody } from "./SurveyQuestion/SurveyQuestionBody/SurveyQuestionBody";
import { SortableList } from "@/components/Sortable/SortableList";
import { ChildrenPosition } from "@/types/ChildrenPosition";
import { useScrollToElement } from "@/hooks/useScrollToElement";
import { useAddQuestionToUrl } from "@/courses/courses-hub/hooks/useAddQuestionToUrl";
import { ItemSize } from "@/types/ItemSize";
import { Button, ButtonType } from "@/components/Button/Button";
import { ButtonBack } from "@/components/Button/ButtonBack/ButtonBack";
import { coursesHubLessonsPrefixApi, coursesHubLessonsPrefixTranslate } from "@/helpers/prefixes";
import { FillBorderUnderlineMode } from "@/types/FillBorderUnderlineMode";
import { CreateLessonChildrenProps } from "../CreateLesson";
import { parseSurveyText } from "@/courses/courses-hub/functions/parseSurveyText";
import { userApiClient } from "@/apiClient";
import { Survey } from "@/courses/types/Survey";
import { usePathname, useRouter } from "next/navigation";
import { removeLastSegment } from "@/helpers/removeLastSegment";
import { RightSidebarWithStickyActions } from "@/components/Sidebar/RightSidebar/RightSidebarWithStickyActions/RightSidebarWithStickyActions";
import { LessonSaveType } from "@/courses/types/LessonSaveType";

interface CreateLessonSurveyProps extends CreateLessonChildrenProps {
    selectedQuestionId?: string;
    questions?: string;
    survey?: Survey;
};

export const CreateLessonSurvey = ({ courseId, lessonId, selectedQuestionId, survey, questions: initialQuestions }: CreateLessonSurveyProps) => {
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

    const handleSetQuestion = (newQuestion?: SurveyQuestion, id?: string) => {
        setQuestions(prevQuestions => {
            if (id) {
                return prevQuestions.filter(question => question.id !== id);
            } else if (newQuestion) {
                return prevQuestions.map(question =>
                    question.id === newQuestion.id ? newQuestion : question
                );
            }
            return prevQuestions;
        });
    }

    const handleAddQuestion = () => {
        const newId = String(Date.now())
        const newQuestion: SurveyQuestion = {
            id: newId,
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
            id: lessonId,
            questions,
            courseId
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
                                    id={item.id}
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