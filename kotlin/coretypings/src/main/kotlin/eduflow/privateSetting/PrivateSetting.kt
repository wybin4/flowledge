package eduflow

import java.util.Date

enum class SettingType {
    BOOLEAN, STRING, PASSWORD, INT, SELECT, FONT, CODE, ACTION
}

typealias SettingValue = Any

data class SettingSelectOption(
    val key: Any,
    val i18nLabel: String
)

data class EnableQuery(
    val query: String
)

interface PrivateSetting: Record {
    val type: SettingType
    val public: Boolean
    val group: String? get() = null
    val section: String? get() = null
    val tab: String? get() = null
    val i18nLabel: String
    val value: SettingValue
    val packageValue: SettingValue
    val enableQuery: EnableQuery? get() = null
    val displayQuery: EnableQuery? get() = null
    val i18nDescription: String? get() = null
    val ts: Date
    val createdAt: Date
    val values: List<SettingSelectOption>? get() = null
    val placeholder: String? get() = null
}