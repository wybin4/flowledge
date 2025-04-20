import { CreateLessonDetails } from "@/courses/courses-hub/components/CreateLesson/CreateLessonDetails/CreateLessonDetails";
import { CreateLessonSurvey } from "@/courses/courses-hub/components/CreateLesson/CreateLessonSurvey/CreateLessonSurvey";
import { LessonPage } from "@/courses/courses-list/components/LessonPage/LessonPage";
import { StuffTypes } from "@/stuff/types/StuffTypes";
import { PageMode } from "@/types/PageMode";

export default async function DynamicCourseHubLessonPage({
    params, searchParams
}: {
    params: { lesson: string };
    searchParams?: { details?: string, hasVideo?: string, survey?: string, questionId?: string };
}) {
    const { lesson } = await params;
    const details = await searchParams?.details || 'false';
    const hasVideo = await searchParams?.hasVideo || 'false';
    const survey = await searchParams?.survey || 'false';
    const questionId = await searchParams?.questionId;

    if (JSON.parse(details) === true) {
        return (<CreateLessonDetails _id={lesson} hasVideo={JSON.parse(hasVideo) === true} />);
    }

    if (JSON.parse(survey) === true) {
        return (<CreateLessonSurvey selectedQuestionId={questionId} />);
    }

    return (<LessonPage
        mode={PageMode.Editor}
        lesson={{
            _id: lesson,
            title: "пример урока",
            time: "30 минут",
            synopsis: `
## классификация case:

- средства анализа и проектирования (например, AllFusion Process Modeler (BPwin), Busines Modeller, IBM Rational Rose и др.);
- средства проектирования баз данных (AllFusion Data Modeler (ERwin), Power Modeller, Emb ERStudio и др.);
- средства разработки и тестирования приложений (TAU/Developer,TAU/Tester, MS VS.Net, Emb RAD-Studio и др.);
- средства реинжиниринга процессов и документирования;
            `,
            imageUrl: 'http://localhost:3000/justpic1.png',
            videoUrl: 'http://localhost:3000/justvideo.mp4',
            stuffs: [
                {
                    _id: '1',
                    type: StuffTypes.Link,
                    value: 'http://localhost:3000/courses-list/1/1',
                },
                {
                    _id: '2',
                    type: StuffTypes.Task,
                    file: {
                        url: 'http://localhost:3000/justdoc.docx',
                        name: 'justdoc.docx'
                    }
                },
            ]
        }}
    />);
}
