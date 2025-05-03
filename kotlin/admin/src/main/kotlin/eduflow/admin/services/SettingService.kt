package eduflow.admin.services

import eduflow.admin.repositories.PrivateSettingRepository
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Service
import kotlin.reflect.KClass

@Service
class SettingService(
    private val settingRepository: PrivateSettingRepository
) {
    @Cacheable("settings")
    fun <T : Any> getSetting(regex: String, clazz: KClass<T>): T {
        val setting = settingRepository.findByRegexId(regex)
            .blockFirst()
        if (setting == null) {
            throw RuntimeException("Setting not found for regex: $regex")
        }

        return when (clazz) {
            String::class -> setting.value as T
            Int::class -> setting.value.toString().toInt() as T
            Boolean::class -> setting.value.toString().toBoolean() as T
            else -> throw IllegalArgumentException("Unsupported type: $clazz")
        }
    }
}