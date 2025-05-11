package eduflow.admin.controllers

import eduflow.admin.services.AuthenticationService
import eduflow.admin.services.UploadService
import org.springframework.core.io.Resource
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.io.FileNotFoundException
import java.io.IOException

@RestController
@RequestMapping("/api")
class UploadController(
    private val uploadService: UploadService,
    private val authenticationService: AuthenticationService
) {

    @PostMapping("/uploads.set")
    fun uploadFile(
        @RequestParam("file") file: MultipartFile
    ): ResponseEntity<Map<String, Any>> {
        return try {
            val user = authenticationService.getCurrentUser()
            val fileId = uploadService.uploadFile(file, user._id)

            ResponseEntity.ok(mapOf("message" to "File uploaded successfully", "fileId" to fileId))
        } catch (e: IOException) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(mapOf("error" to "File upload failed: ${e.message}"))
        }
    }

    @GetMapping("/uploads/progress/{fileId}")
    fun getUploadProgress(@PathVariable fileId: String): ResponseEntity<Map<String, Any>> {
        val progress = 100

        return ResponseEntity.ok(mapOf("fileId" to fileId, "progress" to progress))
    }

    @GetMapping("/uploads.get/{fileId}")
    fun getFile(@PathVariable fileId: String): ResponseEntity<Resource> {
        return try {
            val fileResource = uploadService.getFile(fileId)
            val contentType = MediaType.parseMediaType(uploadService.getFileContentType(fileId))

            ResponseEntity.ok()
                .contentType(contentType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"${fileResource.filename}\"")
                .body(fileResource)
        } catch (e: FileNotFoundException) {
            ResponseEntity.notFound().build()
        }
    }
}