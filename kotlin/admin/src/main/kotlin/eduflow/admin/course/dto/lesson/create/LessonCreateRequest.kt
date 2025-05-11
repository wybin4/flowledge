package eduflow.admin.course.dto.lesson.create

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "type"
)
@JsonSubTypes(
    JsonSubTypes.Type(value = LessonAddDetailsRequest::class, name = "DETAILS"),
    JsonSubTypes.Type(value = LessonAddVideoRequest::class, name = "VIDEO"),
    JsonSubTypes.Type(value = LessonAddVideoRequest::class, name = "REMOVE-VIDEO"),
    JsonSubTypes.Type(value = LessonCreateDraftRequest::class, name = "DRAFT"),
    JsonSubTypes.Type(value = LessonAddSynopsisAndStuffRequest::class, name = "SYNOPSIS")
)
sealed class LessonCreateRequest