package eduflow.admin.utils

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.KotlinModule

interface StringParser {
    fun <T> parseJsonString(jsonString: String, clazz: Class<T>): T {
        if (jsonString.isBlank()) {
            throw IllegalArgumentException("Пустая строка не может быть распарсена как JSON")
        }

        val objectMapper = ObjectMapper().registerModule(KotlinModule.Builder().build())
        return try {
            objectMapper.readValue(jsonString, clazz)
        } catch (e: Exception) {
            throw IllegalArgumentException("Невалидный JSON: ${e.message}")
        }
    }
}