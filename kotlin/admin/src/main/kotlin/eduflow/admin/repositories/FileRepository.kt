package eduflow.admin.repositories

import org.springframework.data.mongodb.gridfs.GridFsTemplate
import org.springframework.stereotype.Repository
import org.springframework.web.multipart.MultipartFile
import java.io.IOException
import org.bson.types.ObjectId
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.gridfs.GridFsResource

@Repository
class FileRepository(private val gridFsTemplate: GridFsTemplate) {

    @Throws(IOException::class)
    fun saveFile(file: MultipartFile): ObjectId {
        return gridFsTemplate.store(file.inputStream, file.originalFilename, file.contentType)
    }

    fun findFileById(fileId: String): ByteArray? {
        // Получаем GridFSFile по ID
        val gridFSFile = gridFsTemplate.findOne(Query(Criteria.where("_id").`is`(ObjectId(fileId))))
        
        // Если файл найден, создаем GridFsResource и читаем его содержимое
        return gridFSFile.let {
            val gridFsResource = gridFsTemplate.getResource(it)
            gridFsResource.inputStream.readBytes()
        }
    }

    fun deleteFile(fileId: String) {
        gridFsTemplate.delete(Query(Criteria.where("_id").`is`(fileId)))
    }
}