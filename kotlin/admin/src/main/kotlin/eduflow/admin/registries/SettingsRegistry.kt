package eduflow.admin.registries

import eduflow.admin.models.PrivateSettingModel
import eduflow.admin.repositories.PrivateSettingRepository
import eduflow.admin.types.SettingDetails
import eduflow.privateSetting.SettingSelectOption
import eduflow.privateSetting.SettingType
import eduflow.privateSetting.SettingValue
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.util.*

@Service
class SettingsRegistry {
    @Autowired
    private lateinit var privateSettingRepository: PrivateSettingRepository

    private val settings = mutableMapOf<String, PrivateSettingModel>()

    private var currentGroupId: String? = null
    private var currentTabId: String? = null

    suspend fun addGroup(groupId: String, block: suspend SettingsRegistry.() -> Unit) {
        currentGroupId = groupId
        try {
            this.block()
        } finally {
            saveAllSettings()
            currentGroupId = null
        }
    }

    suspend fun addTab(tabId: String?, block: suspend SettingsRegistry.() -> Unit) {
        currentTabId = tabId
        try {
            this.block()
        } finally {
            currentTabId = null
        }
    }

    suspend fun addSetting(id: String, packageValue: SettingValue, settingDetails: SettingDetails) {
        requireNotNull(currentGroupId) { "Group should be set before adding settings" }

        val prefix = buildString {
            append(currentGroupId!!.lowercase())
            currentTabId?.let { append(".${it.lowercase()}") }
            append(".$id")
        }

        val settingId = prefix
        val i18nLabel = "${prefix}.name"
        val i18nDescription = "${prefix}.description"
        val placeholder = "${prefix}.placeholder"

        val options = settingDetails.options?.map {
            SettingSelectOption("${prefix}.${it.label.lowercase()}", it.value)
        } ?: emptyList()

        val setting = PrivateSettingModel(
            _id = settingDetails.id ?: settingId,
            type = settingDetails.type,
            public = settingDetails.public,
            i18nLabel = settingDetails.i18nLabel ?: i18nLabel,
            i18nDescription = settingDetails.i18nDescription ?: i18nDescription,
            placeholder = settingDetails.placeholder ?: placeholder,
            options = options,
            value = packageValue,
            packageValue = packageValue,
            ts = Date(),
            createdAt = Date(),
            _updatedAt = Date(),
        )
        settings[settingId] = setting
    }

    suspend fun saveAllSettings() {
        withContext(Dispatchers.IO) {
            privateSettingRepository.saveAll(settings.values)
                .collectList()
                .block()
        }
        settings.clear()
    }
}
