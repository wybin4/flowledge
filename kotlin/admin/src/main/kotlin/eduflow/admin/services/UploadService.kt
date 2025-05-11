package eduflow.admin.services

import com.mongodb.client.gridfs.model.GridFSFile
import eduflow.admin.models.UploadModel
import org.bson.types.ObjectId
import org.springframework.core.io.Resource
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.gridfs.GridFsTemplate
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.io.FileNotFoundException
import java.io.IOException
import java.util.*

@Service
class UploadService(
    private val mongoTemplate: MongoTemplate,
    private val gridFsTemplate: GridFsTemplate
) {
    @Throws(IOException::class)
    fun uploadFile(file: MultipartFile, userId: String): String {
        val fileId = gridFsTemplate.store(file.inputStream, file.originalFilename, file.contentType).toString()

        val upload = UploadModel(
            id = fileId,
            name = file.originalFilename,
            size = file.size,
            type = file.contentType,
            uploadedAt = Date(),
            userId = userId
        )

        mongoTemplate.save(upload)

        return fileId
    }

    fun getFile(fileId: String): Resource {
        val gridFSFile: GridFSFile = gridFsTemplate.findOne(
            org.springframework.data.mongodb.core.query.Query.query(
                org.springframework.data.mongodb.core.query.Criteria.where("_id").`is`(ObjectId(fileId))
            )
        )
            ?: throw FileNotFoundException("File not found with id: $fileId")

        return gridFsTemplate.getResource(gridFSFile)
    }

    fun getFileContentType(fileId: String): String {
        val gridFSFile: GridFSFile = gridFsTemplate.findOne(
            org.springframework.data.mongodb.core.query.Query.query(
                org.springframework.data.mongodb.core.query.Criteria.where("_id").`is`(ObjectId(fileId))
            )
        )
            ?: throw FileNotFoundException("File not found with id: $fileId")

        return gridFSFile.metadata?.getString("_contentType") ?: "application/octet-stream"
    }


}