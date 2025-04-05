import { CoursesHubDetails } from "@/courses/courses-hub/components/CoursesHubDetails/CoursesHubDetails";

export default async function CoursesHubSectionPage({ params }: { params: { id: string } }) {
    const { id } = await params;

    return (
        <CoursesHubDetails
            course={{
                _id: id,
                tags: ['дизайн', 'презентации', 'figma'],
                title: 'cоздание презентаций в figma',
                imageUrl: 'http://localhost:3000/justpic.png',
                description: `
                    Презентация — это инструмент и малая форма дизайна, с которой коллеги часто встречаются, но она всё ещё вызывает много вопросов и страхов. Мы хотим помочь и дать всю нужную информацию. Чему вы научитесь?<br>

💻 Создавать материалы самостоятельно — сможете повысить профессиональную ценность и личную эффективность.<br>

💻 Создавать структурированные, информативные и привлекательные презентации — обмениваться идеями, продвигать продукты и проекты, а также вдохновлять и добиваться поставленных целей.
                    `,
                sections: [
                    {
                        _id: '1',
                        title: 'работа со смыслами',
                        lessons: [
                            {
                                _id: '1',
                                title: 'тема презентации',
                                time: '10 мин',
                                imageUrl: 'http://localhost:3000/justpic1.png',
                                additionalInfo: 'видео, материалы к лекции'
                            },
                            {
                                _id: '2',
                                title: 'базовая структура',
                                time: '12 мин',
                                imageUrl: 'http://localhost:3000/justpic1.png',
                                additionalInfo: 'видео, материалы к лекции'
                            },
                        ],
                    },
                    {
                        _id: '2',
                        title: 'работа с текстом',
                        lessons: [
                            {
                                _id: '1',
                                title: 'что такое текст',
                                time: '10 мин',
                                imageUrl: 'http://localhost:3000/justpic1.png',
                                additionalInfo: 'видео'
                            },
                            {
                                _id: '2',
                                title: 'как создать текст',
                                time: '12 мин',
                                imageUrl: 'http://localhost:3000/justpic1.png',
                                additionalInfo: 'видео'
                            },
                        ],
                    },
                ],
                editors: [
                    {
                        _id: '1',
                        name: 'Иван Иванов',
                        avatar: 'http://localhost:3000/justpic1.png',
                        roleNames: ['moderator']
                    },
                    {
                        _id: '2',
                        name: 'Петр Петров',
                        avatar: 'http://localhost:3000/justpic1.png',
                        roleNames: ['owner', 'creator']
                    },
                    {
                        _id: '3',
                        name: 'Анна Аннина',
                        avatar: 'http://localhost:3000/justpic1.png',
                        roleNames: ['owner']
                    },
                ],
            }}
        />
    );
}
