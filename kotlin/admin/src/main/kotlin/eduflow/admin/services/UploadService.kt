package eduflow.admin.services

import eduflow.admin.models.UploadModel
import org.springframework.data.mongodb.gridfs.GridFsTemplate
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.io.IOException
import java.util.Date

@Service
class UploadService(
    private val mongoTemplate: MongoTemplate,
    private val gridFsTemplate: GridFsTemplate
) {

    @Throws(IOException::class)
    fun uploadFile(file: MultipartFile, userId: String): String {
        // Сохранение файла в GridFS
        val fileId = gridFsTemplate.store(file.inputStream, file.originalFilename, file.contentType).toString()

        // Создание модели UploadModel
        val upload = UploadModel(
            id = fileId,
            name = file.originalFilename,
            size = file.size,
            type = file.contentType,
            uploadedAt = Date(),
            userId = userId
        )

        // Сохранение модели в MongoDB
        mongoTemplate.save(upload)

        return fileId
    }
}