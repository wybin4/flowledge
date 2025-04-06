package eduflow.admin.controllers

import eduflow.admin.services.UploadService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.io.IOException

@RestController
@RequestMapping("/api")
class UploadController(private val uploadService: UploadService) {

    @PostMapping("/uploads.set")
    fun uploadFile(
        @RequestParam("file") file: MultipartFile,
        @RequestParam("userId") userId: String
    ): ResponseEntity<Map<String, Any>> {
        return try {
            val fileId = uploadService.uploadFile(file, userId)

            ResponseEntity.ok(mapOf("message" to "File uploaded successfully", "fileId" to fileId))
        } catch (e: IOException) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(mapOf("error" to "File upload failed: ${e.message}"))
        }
    }

    @GetMapping("/uploads/progress/{fileId}")
    fun getUploadProgress(@PathVariable fileId: String): ResponseEntity<Map<String, Any>> {
        // Здесь вы можете реализовать логику для получения прогресса загрузки
        // Например, если вы храните прогресс в базе данных или в памяти
        val progress = 100 // Замените на реальную логику получения прогресса

        return ResponseEntity.ok(mapOf("fileId" to fileId, "progress" to progress))
    }
}