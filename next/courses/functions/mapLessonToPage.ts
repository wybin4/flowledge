import { uploadsApiPrefix } from "@/apiClient";

export const mapLessonToPage = <T extends { videoId?: string }>(lesson: T): T & { videoUrl?: string } => {
    return {
        ...lesson,
        videoUrl: lesson.videoId ? `${uploadsApiPrefix}.get/${lesson.videoId}` : undefined
    };
};