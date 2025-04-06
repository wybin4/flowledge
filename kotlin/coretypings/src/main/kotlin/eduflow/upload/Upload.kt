package eduflow.upload

import java.util.Date

interface Upload {
    val id: String?
    val typeGroup: String?
    val type: String?
    val name: String?
    val extension: String?
    val userId: String?
    val size: Long?
    val path: String?
    val uploadedAt: Date?
    val modifiedAt: Date?
    val url: String?
}