import { CoursesListItem } from "@/courses/courses-list/components/CoursesListPageItem/CoursesListItem";
import { ChildrenPosition } from "@/types/ChildrenPosition";
import { Breadcrumbs } from "@/components/Breadcrumbs/Breadcrumbs";

export default async function DynamicCourseListSectionPage({ params }: { params: { section: string } }) {
    const { section } = await params;

    return (
        <>
            <CoursesListItem
                actionsPosition={ChildrenPosition.Top}
                course={{
                    _id: section,
                    title: 'cоздание презентаций в figma',
                    imageUrl: 'http://localhost:3000/justpic.png',
                    description: `
                    Презентация — это инструмент и малая форма дизайна, с которой коллеги часто встречаются, но она всё ещё вызывает много вопросов и страхов. Мы хотим помочь и дать всю нужную информацию. Чему вы научитесь?<br>

💻 Создавать материалы самостоятельно — сможете повысить профессиональную ценность и личную эффективность.<br>

💻 Создавать структурированные, информативные и привлекательные презентации — обмениваться идеями, продвигать продукты и проекты, а также вдохновлять и добиваться поставленных целей.
                    `,
                    lessons: [
                        {
                            _id: '1',
                            title: 'работа со смыслами',
                            time: '10 мин',
                            imageUrl: 'http://localhost:3000/justpic1.png',
                        },
                    ],
                }}
                header={<Breadcrumbs position={ChildrenPosition.Left} />}
                pointer={false}
                isTitleClickable={false}
                hasMenu={true}
            />
        </>
    );
}
