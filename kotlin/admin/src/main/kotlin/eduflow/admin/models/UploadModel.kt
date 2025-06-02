package flowledge.admin.models

import flowledge.upload.Upload
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.util.Date

@Document(collection = "uploads")
data class UploadModel(
    @Id
    override val id: String? = null,
    override val typeGroup: String? = null,
    override val type: String? = null,
    override val name: String? = null,
    override val extension: String? = null,
    override val userId: String? = null,
    override val size: Long? = null,
    override val path: String? = null,
    override val uploadedAt: Date? = null,
    override val modifiedAt: Date? = null,
    override val url: String? = null,
) : Upload
