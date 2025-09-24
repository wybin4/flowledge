export interface Course {
    id: string;
    title: string;
    description: string;
    createdAt: string;
    imageUrl: string;
    u: {
        id: string;
        name: string;
    };
    tags: string[];
    isPublished?: boolean;
    versionId: string;
    versionName: string;
}