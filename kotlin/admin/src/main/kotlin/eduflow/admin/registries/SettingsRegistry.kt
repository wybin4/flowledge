package eduflow.admin

import eduflow.admin.models.PrivateSettingModel
import eduflow.admin.repositories.PrivateSettingRepository
import eduflow.privateSetting.SettingSelectOption
import eduflow.privateSetting.SettingType
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.util.*

data class SettingDetails(
    val id: String? = null,
    val type: SettingType,
    val public: Boolean = false,
    val i18nLabel: String? = null,
    val i18nDescription: String? = null,
    val placeholder: String? = null,
    val options: List<SettingSelectOption>?
)

@Service
class SettingsRegistry {
    @Autowired
    private lateinit var privateSettingRepository: PrivateSettingRepository

    private val settings = mutableMapOf<String, PrivateSettingModel>()

    private var currentGroupId: String? = null
    private var currentTabId: String? = null

    suspend fun addGroup(groupId: String, block: suspend SettingsRegistry.() -> Unit) {
        currentGroupId = groupId
        this.block()
        println(settings)
        saveAllSettings()
        currentGroupId = null
    }

    suspend fun addTab(tabId: String, block: suspend SettingsRegistry.() -> Unit) {
        requireNotNull(currentGroupId) { "Group should be set before adding a tab" }
        currentTabId = tabId
        this.block()
        currentTabId = null
    }

    suspend fun addSetting(id: String, packageValue: String, settingDetails: SettingDetails) {
        requireNotNull(currentGroupId) { "Group should be set before adding settings" }
        requireNotNull(currentTabId) { "Tab should be set before adding settings" }

        val prefix = "${currentGroupId!!.lowercase()}.${currentTabId!!.lowercase()}.$id".lowercase()

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
