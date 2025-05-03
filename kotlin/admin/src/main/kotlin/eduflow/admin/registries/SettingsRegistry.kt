package eduflow.admin.registries

import eduflow.admin.models.PrivateSettingModel
import eduflow.admin.repositories.PrivateSettingRepository
import eduflow.admin.types.SettingDetails
import eduflow.privateSetting.SettingSelectOption
import eduflow.privateSetting.SettingType
import eduflow.privateSetting.SettingValue
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.reactor.awaitSingleOrNull
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

        val settingId = settingDetails.id ?: prefix

        val existingSetting = privateSettingRepository.findById(settingId).awaitSingleOrNull()

        val i18nLabel = settingDetails.i18nLabel ?: "${prefix}.name"
        val i18nDescription = settingDetails.i18nDescription ?: "${prefix}.description"
        val placeholder = settingDetails.placeholder ?: "${prefix}.placeholder"

        val options = settingDetails.options?.map {
            SettingSelectOption("${prefix}.${it.label.lowercase()}", it.value)
        } ?: emptyList()

        val newSetting = existingSetting?.copy(
            type = settingDetails.type,
            public = settingDetails.public,
            i18nLabel = i18nLabel,
            i18nDescription = i18nDescription,
            placeholder = placeholder,
            options = options,
            value = packageValue,
            packageValue = packageValue,
            _updatedAt = Date(),
        ) ?: PrivateSettingModel(
            _id = settingId,
            type = settingDetails.type,
            public = settingDetails.public,
            i18nLabel = i18nLabel,
            i18nDescription = i18nDescription,
            placeholder = placeholder,
            options = options,
            value = packageValue,
            packageValue = packageValue,
            ts = Date(),
            createdAt = Date(),
            _updatedAt = Date(),
        )

        if (existingSetting != null) {
            val isEqual = existingSetting.type == newSetting.type &&
                    existingSetting.public == newSetting.public &&
                    existingSetting.i18nLabel == newSetting.i18nLabel &&
                    existingSetting.i18nDescription == newSetting.i18nDescription &&
                    existingSetting.placeholder == newSetting.placeholder &&
                    existingSetting.options == newSetting.options &&
                    existingSetting.packageValue == newSetting.packageValue

            if (isEqual) {
                return
            }
        }

        settings[settingId] = newSetting
    }

    suspend fun initializeDefaultSettings() {
        this.addGroup("user-default") {
            addTab("appearance") {
                addSetting(
                    "theme", "AUTO", SettingDetails(
                        type = SettingType.SELECTOR_FINITE,
                        public = true,
                        options = listOf(
                            SettingSelectOption("AUTO", "AUTO"),
                            SettingSelectOption("DARK", "DARK"),
                            SettingSelectOption("LIGHT", "LIGHT")
                        )
                    )
                )

                addSetting(
                    "language", "EN", SettingDetails(
                        type = SettingType.SELECTOR_INFINITE,
                        public = true,
                        options = listOf(
                            SettingSelectOption("EN", "EN"),
                            SettingSelectOption("RU", "RU")
                        )
                    )
                )
            }
        }

        this.addGroup("ldap") {
            addSetting(
                "enabled", false, SettingDetails(
                    type = SettingType.RADIO,
                    public = true
                )
            )
            addSetting(
                "map-groups-to-courses",
                """{"ad-group-1": ["course1", "course-tag-1", "course2"], "ad-group-2": ["course-tag-2"]}""",
                SettingDetails(
                    type = SettingType.CODE,
                )
            )
            addTab("connection") {
                addSetting(
                    "host", "", SettingDetails(
                        type = SettingType.INPUT_TEXT
                    )
                )
                addSetting(
                    "port", 389, SettingDetails(
                        type = SettingType.INPUT_NUMBER
                    )
                )
            }
            addTab("auth") {
                addSetting(
                    "dn", "", SettingDetails(
                        type = SettingType.INPUT_TEXT
                    )
                )
                addSetting(
                    "password", "", SettingDetails(
                        type = SettingType.INPUT_PASSWORD
                    )
                )
            }
            addTab("user") {
                addSetting(
                    "base-dn", "", SettingDetails(
                        type = SettingType.INPUT_TEXT
                    )
                )
                addSetting(
                    "search-filter", "", SettingDetails(
                        type = SettingType.INPUT_TEXT
                    )
                )
            }
            addTab("group") {
                addSetting(
                    "base-dn", "", SettingDetails(
                        type = SettingType.INPUT_TEXT
                    )
                )
            }
        }

        this.addGroup("file-upload") {
            addTab("stuff") {
                addSetting(
                    "task", "*", SettingDetails(
                        type = SettingType.INPUT_TEXT,
                    )
                )
                addSetting(
                    "presentation", "*", SettingDetails(
                        type = SettingType.INPUT_TEXT,
                    )
                )
            }
            addSetting(
                "video", "*", SettingDetails(
                    type = SettingType.INPUT_TEXT,
                )
            )
            addSetting(
                "size", 104857600, SettingDetails(
                    type = SettingType.INPUT_NUMBER,
                )
            )
        }

        this.addGroup("security") {
            addSetting(
                "link-restrictions", "[\"e.example.ru\"]", SettingDetails(
                    type = SettingType.INPUT_TEXT,
                )
            )
        }
        this.addGroup("discover") {
            addSetting(
                "page-size", 10, SettingDetails(
                    type = SettingType.INPUT_NUMBER,
                )
            )
            addSetting(
                "preview-page-size", 5, SettingDetails(
                    type = SettingType.INPUT_NUMBER,
                )
            )
        }

        this.addGroup("courses-hub") {
            addSetting(
                "title-length", "(3, 100)", SettingDetails(
                    type = SettingType.INPUT_TEXT,
                )
            )
            addSetting(
                "title-regex", "[a-zA-Zа-яА-Я0-9_]+", SettingDetails(
                    type = SettingType.INPUT_TEXT,
                )
            )
        }
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
