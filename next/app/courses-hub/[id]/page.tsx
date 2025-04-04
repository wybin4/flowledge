
export default async function CoursesHubSectionPage({ params }: { params: { id: string } }) {
    const { id } = await params;

    return (
        <div>{id}</div>
    );
}
